import { oauth2Client, PrismaClient } from '@prisma/client';
import { DefaultState, Middleware } from 'koa';
import { db } from '../../db';
import { BearerTokenError } from '../BearerTokenError';
import { verifyJwt } from '../jwt';
import { OAuth2Error } from '../OAuth2Error';

type OAuth2ClientContext = {
  id: string;
  secret: string;
  allowedScopes: string[];
  redirectUris: string[];
};
export type KoaContext = {
  db: PrismaClient;
  oauth2: {
    client: OAuth2ClientContext | null;
    token: {
      client: OAuth2ClientContext;
      user: {
        id: string;
      } | null;
      scopes: string[];
    } | null;
  };
};

type OAuth2Middleware = Middleware<
  DefaultState,
  KoaContext
>;

const createClientContextObject = (
  client: oauth2Client
): OAuth2ClientContext => {
  return {
    id: client.id,
    secret: client.secret,
    allowedScopes: client.allowedScopes.split(' '),
    redirectUris: client.redirectUris.split('\n'),
  };
};

export const createContext: OAuth2Middleware = async (
  ctx,
  next
) => {
  ctx.db = db;
  ctx.oauth2 = {
    client: null,
    token: null,
  };
  await next();
};

export const tryAuthenticateClient: (
  requireAuth: boolean
) => OAuth2Middleware = (requireAuth: boolean) => async (
  ctx,
  next
) => {
  let client_id = '',
    client_secret = '';
  if (
    ctx.request.headers.authorization?.startsWith('Basic ')
  ) {
    const authorization = Buffer.from(
      ctx.request.headers.authorization.substring(6),
      'base64'
    )
      .toString('ascii')
      .split(':');

    client_id = authorization[0];
    client_secret = authorization[1];
  } else if (
    ctx.request.body.client_id &&
    ctx.request.body.client_secret
  ) {
    client_id = ctx.request.body.client_id;
    client_secret = ctx.request.body.client_secret;
  } else if (requireAuth) {
    ctx.throw(400, new OAuth2Error('invalid_request'));
  }

  const client = await ctx.db.oauth2Client.findFirst({
    where: {
      id: client_id,
      secret: client_secret,
    },
  });

  if (client !== null)
    ctx.oauth2.client = createClientContextObject(client);
  else if (requireAuth)
    ctx.throw(400, new OAuth2Error('invalid_client'));
  await next();
};

export const authenticateToken: (options: {
  requiredScopes?: string[];
  requireUser?: boolean;
}) => OAuth2Middleware = ({
  requiredScopes = null,
  requireUser = false,
}) => {
  return async (ctx, next) => {
    const { authorization } = ctx.request.headers;
    if (typeof authorization === 'string') {
      if (!authorization.startsWith('Bearer'))
        return ctx.throw(
          401,
          new BearerTokenError('invalid_request')
        );

      let token: any = {};
      try {
        token = await verifyJwt(
          authorization.substring(7),
          'oAuth2Token'
        );

        if (token.is_oauth2_access_token !== true)
          throw new Error('Not OAuth2 Access token');
      } catch (err) {
        console.error(err);
        return ctx.throw(
          400,
          new BearerTokenError('invalid_token')
        );
      }

      if (
        requiredScopes !== null &&
        requiredScopes.some(
          (i: string) => !token.scopes.includes(i)
        )
      ) {
        return ctx.throw(
          401,
          new BearerTokenError('insufficient_scope')
        );
      }

      if (requireUser && typeof token.sub === 'undefined')
        return ctx.throw(
          401,
          new BearerTokenError('invalid_token')
        );

      ctx.oauth2.token = {
        client: createClientContextObject(
          await ctx.db.oauth2Client.findUnique({
            where: { id: token.aud },
          })
        ),
        user: token.sub
          ? {
              id: token.sub,
            }
          : null,
        scopes: token.scopes,
      };

      await next();
    } else {
      ctx.throw(
        401,
        new BearerTokenError('invalid_request')
      );
    }
  };
};
