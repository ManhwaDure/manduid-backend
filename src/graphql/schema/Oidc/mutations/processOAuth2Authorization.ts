import { extendType, nonNull, stringArg } from 'nexus';
import { verifyJwt } from '../../../../http/jwt';

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
          throw new Error(
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
          throw new Error('Invalid oauth2 client');

        if (
          !client.redirectUris
            .split('\n')
            .includes(redirect_uri)
        )
          throw new Error('Invalid oauth2 redirect uri');

        // Support only authorization code grant
        if (response_type !== 'code')
          return (
            redirect_uri +
            '?error=invalid_request&error_description=unsupported_response_type'
          );

        // Verify scope
        const scopesRequested = scope.split(
          ' '
        ) as string[];
        if (
          scopesRequested.some(
            (i) =>
              !client.allowedScopes.split(' ').includes(i)
          )
        )
          return (
            redirect_uri +
            '?error=invalid_request&error_description=invalid_redirect_uri'
          );

        const openIdRequested = scopesRequested.includes(
          'openid'
        );
        if (openIdRequested) {
          // Process Prompt, with support of "none" only
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
      },
    });
  },
});
