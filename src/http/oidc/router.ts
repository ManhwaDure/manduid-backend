import fs from 'fs/promises';
import { JWKS } from 'jose';
import Router from 'koa-router';
import { BearerTokenError } from '../BearerTokenError';
import { getOidcKeystore } from '../jwt';
import { authenticateToken } from '../oauth2/middlewares';
import claims from './claims';

const createUrl = (url = '') => {
  const { HTTP_API_ENDPOINT } = process.env;
  return `${HTTP_API_ENDPOINT}${url}`;
};

const { OIDC_JWKS_PATH } = process.env;
const router = new Router();
router.get('/openid-configuration', async (ctx) => {
  ctx.response.type = 'application/json';
  const keystore = await getOidcKeystore();
  ctx.body = JSON.stringify({
    issuer: process.env.OIDC_ISSUER,
    authorization_endpoint: createUrl('/authorize'), // Authorization is done on frontend
    token_endpoint: createUrl('/token'),
    userinfo_endpoint: createUrl('/userinfo'),
    jwks_uri: createUrl('/jwks'),
    scopes_supported: ['openid'],
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: keystore
      .all({ use: 'sig' })
      .map((i) => i.algorithms('sign'))
      .reduce((prev, cur) => {
        for (const value of cur)
          if (!prev.includes(value)) prev.push(value);
        return prev;
      }, []),
  });
});

router.get('/jwks', async (ctx) => {
  ctx.response.type = 'application/json';
  const keystore = JWKS.asKeyStore(
    JSON.parse(await fs.readFile(OIDC_JWKS_PATH, 'utf8'))
  );

  ctx.body = JSON.stringify(keystore.toJWKS(false));
});

router.get(
  '/userinfo',
  authenticateToken({ requiredScopes: ['openid'] }),
  async (ctx) => {
    let availableClaims: string[] = [];
    if (ctx.oauth2.token.user === null)
      throw new BearerTokenError('invalid_token');
    const allowedScopes = ctx.oauth2.token.scopes;
    if (allowedScopes.includes('profile')) {
      availableClaims = availableClaims.concat([
        'name',
        'family_name',
        'given_name',
        'middle_name',
        'nickname',
        'preferred_username',
        'profile',
        'picture',
        'website',
        'gender',
        'birthdate',
        'zoneinfo',
        'locale',
        'updated_at',
      ]);
    }
    if (allowedScopes.includes('email')) {
      availableClaims = availableClaims.concat([
        'email',
        'email_verified',
      ]);
    }
    if (allowedScopes.includes('address')) {
      availableClaims = availableClaims.concat(['address']);
    }
    if (allowedScopes.includes('phone')) {
      availableClaims = availableClaims.concat([
        'phone_number',
        'phone_number_verified',
      ]);
    }

    const userinfo: any = await claims(
      await ctx.db.sSOUser.findUnique({
        where: { id: ctx.oauth2.token.user.id },
        include: {
          member: true,
        },
      }),
      availableClaims
    );
    userinfo.sub = ctx.oauth2.token.user.id;

    ctx.response.type = 'application/json';
    ctx.body = JSON.stringify(userinfo);
  }
);

export default router;
