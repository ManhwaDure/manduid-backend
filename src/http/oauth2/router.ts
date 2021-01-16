import { DefaultState } from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';
import {
  createIdToken,
  createOAuth2Token,
  verifyJwt,
} from '../jwt';
import { OAuth2Error } from '../OAuth2Error';
import {
  KoaContext,
  tryAuthenticateClient,
} from './middlewares';

const router = new Router<DefaultState, KoaContext>();
router.get('/authorize', async (ctx) => {
  const { id } = await ctx.db.oauth2Interaction.create({
    data: {
      params: ctx.request.query,
    },
  });

  ctx.redirect(`/authorize_api/${id}`);
});
router.get(
  '/authorize',
  koaBody({ urlencoded: true }),
  async (ctx) => {
    const { id } = await ctx.db.oauth2Interaction.create({
      data: {
        params: ctx.request.body,
      },
    });

    ctx.redirect(`/authorize_api/${id}`);
  }
);
router.post(
  '/token',
  koaBody({ urlencoded: true }),
  tryAuthenticateClient(true),
  async (ctx) => {
    const { grant_type } = ctx.request.body;

    switch (grant_type) {
      case 'authorization_code': {
        const { code, redirect_uri } = ctx.request.body;
        const authorizationCode = await ctx.db.oauth2AuthorizationCode.findFirst(
          {
            where: {
              code,
              clientId: ctx.oauth2.client.id,
              expiredAt: {
                gte: new Date(),
              },
            },
          }
        );
        if (authorizationCode === null)
          throw new OAuth2Error('invalid_request');

        const user = authorizationCode.userId
          ? await ctx.db.sSOUser.findUnique({
              where: {
                id: authorizationCode.userId,
              },
              include: {
                member: true,
              },
            })
          : null;

        if (authorizationCode === null)
          throw new OAuth2Error('invalid_request');
        else if (grant_type !== 'authorization_code')
          throw new OAuth2Error('unsupported_grant_type');
        else if (
          !ctx.oauth2.client.redirectUris.includes(
            redirect_uri
          )
        )
          throw new OAuth2Error('invalid_request');

        const allowedScopes = authorizationCode.allowedScope.split(
          ' '
        );
        ctx.response.type = 'application/json';
        const {
          access_token,
          refresh_token,
        } = createOAuth2Token(ctx.oauth2.client.id, {
          userId: user.id,
          scopes: allowedScopes,
        });
        const token_type = 'Bearer',
          expires_in = 60 * 60;
        if (allowedScopes.includes('openid')) {
          // Return with ID Token
          ctx.body = JSON.stringify({
            token_type,
            access_token,
            refresh_token,
            expires_in,
            id_token: await createIdToken(user, {
              audienceId: ctx.oauth2.client.id,
              authenticatedAt: new Date(),
              nonce: authorizationCode.nonce,
            }),
          });
        } else {
          // Do not return with ID Token
          ctx.body = JSON.stringify({
            token_type,
            access_token,
            refresh_token,
            expires_in,
          });
        }

        await ctx.db.oauth2AuthorizationCode.delete({
          where: {
            code,
          },
        });
        break;
      }
      case 'client_credentials': {
        const { scope } = ctx.request.body;
        if (typeof scope !== 'string')
          return ctx.throw(
            400,
            new OAuth2Error('invalid_scope')
          );
        const allowedScopes = scope
          .split(' ')
          .filter((i: string) =>
            ctx.oauth2.client.allowedScopes.includes(i)
          );
        const { access_token } = createOAuth2Token(
          ctx.oauth2.client.id,
          {
            scopes: allowedScopes,
          }
        );

        ctx.response.type = 'application/json';
        ctx.body = JSON.stringify({
          access_token,
          token_type: 'Bearer',
          expires_in: 60 * 60,
        });
        break;
      }
      case 'refresh_token': {
        const { refresh_token, scope } = ctx.request.body;

        const verified: any = await verifyJwt(
          refresh_token,
          'oAuth2Token'
        );

        if (verified.is_oauth2_refresh_token === true) {
          const {
            access_token,
            refresh_token,
          } = createOAuth2Token(verified.aud, {
            userId: verified.sub || undefined,
            scopes:
              scope
                ?.split(' ')
                .filter(
                  (i: string) =>
                    i.trim().length !== 0 &&
                    verified.scopes.includes(i)
                ) || verified.scopes,
          });

          ctx.response.type = 'application/json';
          ctx.body = JSON.stringify({
            access_token,
            refresh_token,
            expires_in: 60 * 60,
            token_type: 'Bearer',
          });
        } else {
          throw new OAuth2Error('invalid_token');
        }
        break;
      }
      default: {
        throw new OAuth2Error('unsupported_grant_type');
      }
    }
  }
);

export default router;
