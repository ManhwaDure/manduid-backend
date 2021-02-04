import { extendType, nonNull, stringArg } from 'nexus';
import querystring from 'querystring';
import claims from '../../../../http/oidc/claims';
import { getAvailableClaimsByScopes } from '../../../../http/oidc/filterClaimsByScopes';
import {
  createIdToken,
  createOAuth2Token,
  verifyJwt,
} from '../../../../jwt';
import { GraphQLExposableError } from '../../../exposableError';

export const processOAuth2Authorization = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.string('processOAuth2Authorization', {
      description:
        'OAuth2 Authorization을 처리합니다. 리다이렉션할 URL을 반환합니다.',
      args: {
        interactionId: nonNull(
          stringArg({
            description: 'OAuth2 Interaction Id',
          })
        ),
      },
      async resolve(_parent, { interactionId }, ctx) {
        // Get interaction data, throw error if null
        const interaction = await ctx.db.oauth2Interaction.findUnique(
          {
            where: {
              id: interactionId,
            },
          }
        );

        if (interaction === null)
          throw new GraphQLExposableError(
            'OAuth2 Interaction ID가 잘못됐습니다.'
          );

        // Deconstructs interaction parameters
        // No plan to support display, ui_locales, max_age
        const {
          response_type,
          client_id,
          redirect_uri,
          scope,
          state,
          nonce,
          prompt,
          id_token_hint,
          login_hint,
        } = interaction.params as any;

        // Verify client id and redirect uri, throw error if not valid
        const client = await ctx.db.oauth2Client.findUnique(
          {
            where: {
              id: client_id,
            },
          }
        );

        if (client === null)
          throw new GraphQLExposableError(
            'OAuth2 Client id가 올바르지 않습니다.'
          );

        if (
          !client.redirectUris
            .split('\n')
            .includes(redirect_uri)
        )
          throw new GraphQLExposableError(
            'Redirect_uri이 올바르지 않습니다.'
          );

        // Parse scope into array
        const scopesRequested = scope.split(
          ' '
        ) as string[];

        // Insert defaultAddedScope into scope array
        if (client.defaultAddedScopes.trim().length !== 0)
          for (const i of client.defaultAddedScopes
            .trim()
            .split(' '))
            if (!scopesRequested.includes(i))
              scopesRequested.push(i);

        // Verify scope
        if (
          scopesRequested.some(
            (i) =>
              !client.allowedScopes.split(' ').includes(i)
          )
        )
          return (
            redirect_uri +
            '?error=invalid_request&error_description=invalid_scope'
          );
        const openIdRequested = scopesRequested.includes(
          'openid'
        );

        // require nonce if implicit flow
        if (
          openIdRequested &&
          (response_type === 'id_token token' ||
            response_type === 'id_token') &&
          typeof nonce !== 'string'
        ) {
          return (
            redirect_uri +
            '?error=invalid_request&error_description=nonce_required_for_implicit_flow'
          );
        }

        // Process Prompt, with support of "none" only
        if (openIdRequested) {
          if (prompt) {
            const prompts = prompt.split(' ') as string[];
            if (prompts.includes('none')) {
              if (prompts.length > 2)
                return (
                  redirect_uri +
                  '?error=invalid_request&error_description=invalid_prompt'
                );
              if (!ctx.user.authenticated)
                return (
                  redirect_uri + '?error=login_required'
                );
            }
          }
        }

        // Request login if not
        if (!ctx.user.authenticated) {
          return (
            'https://id.caumd.club/login?redirect=' +
            encodeURIComponent(
              `https://id.caumd.club/authorize_api/${interactionId}`
            )
          );
        }

        // Process id token hint
        if (openIdRequested) {
          if (id_token_hint) {
            const idToken: any = await verifyJwt(
              id_token_hint,
              'idToken'
            );

            if (idToken.sub !== ctx.user.ssoUserId)
              return (
                redirect_uri +
                '?error=login_required&error_description=dismatched_with_id_token_hint'
              );
          }

          if (login_hint) {
            if (login_hint !== ctx.user.ssoUserId)
              return (
                redirect_uri +
                'error?login_required&error_description=dismatched_with_login_hint'
              );
          }
        }

        switch (response_type) {
          case 'code': {
            const code = await ctx.db.oauth2AuthorizationCode.create(
              {
                data: {
                  allowedScope: scopesRequested.join(' '),
                  client: {
                    connect: {
                      id: client_id,
                    },
                  },
                  expiredAt: new Date(
                    Date.now() + 60 * 60 * 1000
                  ),
                  nonce,
                  user: {
                    connect: {
                      id: ctx.user.ssoUserId,
                    },
                  },
                  graphQlSession: {
                    connect: {
                      id: ctx.user.sessionId,
                    },
                  },
                },
              }
            );

            await ctx.db.oauth2Interaction.delete({
              where: {
                id: interactionId,
              },
            });

            if (state)
              return (
                redirect_uri +
                '?code=' +
                encodeURIComponent(code.code) +
                '&state=' +
                encodeURIComponent(state)
              );
            else
              return (
                redirect_uri +
                '?code=' +
                encodeURIComponent(code.code)
              );
          }
          case 'id_token token':
          case 'id_token': {
            const { access_token } = createOAuth2Token(
              client_id,
              {
                userId: ctx.user.ssoUserId,
                scopes: scopesRequested,
              }
            );
            const token_type = 'Bearer',
              expires_in = 60 * 60;

            let result;
            if (scopesRequested.includes('openid')) {
              // Created Oidc Session associated with this id token
              const {
                id: sessionId,
              } = await ctx.db.oidcSession.create({
                data: {
                  client: {
                    connect: {
                      id: client_id,
                    },
                  },
                  graphQlSession: {
                    connect: {
                      id: ctx.user.sessionId,
                    },
                  },
                },
              });

              // Query user
              const user = await ctx.db.sSOUser.findUnique({
                where: { id: ctx.user.ssoUserId },
                include: {
                  member: true,
                },
              });

              // Create Id Token
              const id_token = await createIdToken(user, {
                audienceId: client_id,
                authenticatedAt: new Date(),
                nonce,
                sessionId,
                isLogoutToken: false,
                claims:
                  response_type === 'id_token' &&
                  (await claims(
                    user,
                    getAvailableClaimsByScopes(
                      scopesRequested
                    ),
                    {
                      permissionsAsObject:
                        client.returnPermissionsAsObject,
                    }
                  )),
              });

              // Encode as fragment
              const encodedFragment = querystring.encode(
                response_type.endsWith(' token')
                  ? {
                      access_token,
                      token_type,
                      id_token,
                      state,
                      expires_in,
                    }
                  : {
                      id_token,
                      state,
                      expires_in,
                    }
              );

              result = redirect_uri + '#' + encodedFragment;
            } else {
              result =
                redirect_uri +
                '?error=invalid_request&id_token_response_type_without_openid_scope';
            }
            await ctx.db.oauth2Interaction.delete({
              where: {
                id: interactionId,
              },
            });
            return result;
          }
          default: {
            return (
              redirect_uri +
              '?error=invalid_request&error_description=unsupported_response_type'
            );
          }
        }
      },
    });
  },
});
