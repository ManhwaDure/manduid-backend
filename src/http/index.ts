import Koa, { DefaultContext, DefaultState } from 'koa';
import UserApiRouter from './getUsersApi';
import { createContext } from './oauth2/middlewares';
import OAuth2Router from './oauth2/router';
import OidcRouter from './oidc/router';

const koa = new Koa<DefaultState, DefaultContext>();
koa.use(createContext);
koa.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (
      err.name === 'OAuth2Error' ||
      err.name === 'BearerTokenError'
    ) {
      ctx.response.type = 'application/json';
      ctx.body = JSON.stringify({ error: err.message });
    } else {
      ctx.response.type = 'application/json';
      ctx.body = JSON.stringify({ error: 'server_error' });
      console.error(err);
    }
  }
});
koa.use(OidcRouter.allowedMethods());
koa.use(OidcRouter.routes());
koa.use(OAuth2Router.allowedMethods());
koa.use(OAuth2Router.routes());
koa.use(UserApiRouter.allowedMethods());
koa.use(UserApiRouter.routes());

export default koa;
