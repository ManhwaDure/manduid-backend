import { SSOUser } from '@prisma/client';
import fs from 'fs/promises';
import { JWKS, JWT } from 'jose';
import jwt from 'jsonwebtoken';

type createOAuth2TokenFunction = (
  clientId: string,
  options: {
    userId?: string;
    scopes: string[];
  }
) => {
  access_token: string;
  refresh_token: string;
};

type createIdTokenFunction = (
  user: SSOUser,
  options: {
    audienceId: string;
    authenticatedAt: Date;
    nonce?: string;
  }
) => Promise<string>;

const { OAUTH2_JWT_SECRET, OIDC_JWKS_PATH } = process.env;

export const getOidcKeystore = async (): Promise<JWKS.KeyStore> => {
  return JWKS.asKeyStore(
    JSON.parse(await fs.readFile(OIDC_JWKS_PATH, 'utf8'))
  );
};

export const createOAuth2Token: createOAuth2TokenFunction = (
  clientId,
  { userId, scopes }
) => {
  const audience = clientId,
    encoding = 'utf-8',
    issuer = 'https://id.caumd.club',
    subject = userId || undefined;
  return {
    access_token: jwt.sign(
      {
        is_oauth2_access_token: true,
        scopes,
      },
      OAUTH2_JWT_SECRET,
      {
        expiresIn: 60 * 60,
        audience,
        encoding,
        issuer,
        subject,
      }
    ),
    refresh_token: jwt.sign(
      {
        is_oauth2_refresh_token: true,
        scopes,
      },
      OAUTH2_JWT_SECRET,
      {
        expiresIn: 60 * 60,
        audience,
        encoding,
        issuer,
        subject,
      }
    ),
  };
};

export const createIdToken: createIdTokenFunction = async (
  user,
  options
) => {
  const jwks = await getOidcKeystore();
  return JWT.sign(
    {
      auth_time: Math.floor(
        options.authenticatedAt.getTime() / 1000
      ),
      nonce: options.nonce || undefined,
    },
    jwks.get({
      use: 'sig',
    }),
    {
      algorithm: 'RS256', // default algorithm is RS256 if not specified during client registeration
      expiresIn: '1 h',
      audience: options.audienceId,
      issuer: 'https://id.caumd.club',
      subject: user.id,
    }
  );
};

export const verifyJwt = async (
  jwtString: string,
  jwtType: 'oAuth2Token' | 'idToken'
): Promise<any> => {
  const jwks = await getOidcKeystore();
  if (jwtType == 'oAuth2Token')
    return jwt.verify(jwtString, OAUTH2_JWT_SECRET, {
      issuer: 'https://id.caumd.club',
    });
  else
    return JWT.verify(jwtString, jwks, {
      issuer: 'https://id.caumd.club',
    });
};
