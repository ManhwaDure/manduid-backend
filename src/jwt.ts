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
  options:
    | {
        audienceId: string;
        authenticatedAt: Date;
        sessionId: string;
        nonce?: string;
        jti?: string;
        authTime?: boolean;
        isLogoutToken: false;
      }
    | {
        audienceId: string;
        sessionId: string;
        jti: string;
        authTime: false;
        isLogoutToken: true;
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
      auth_time:
        options.authTime !== false
          ? Math.floor(
              options.authenticatedAt.getTime() / 1000
            )
          : undefined,
      nonce:
        options.isLogoutToken === false
          ? options.nonce || undefined
          : undefined,
      sid: options.sessionId,
      events: options.isLogoutToken
        ? {
            'https://schemas.openid.net/event/backchannel-logout': {},
          }
        : undefined,
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
      iat: true,
      jti: options.jti || undefined,
    }
  );
};

export const verifyJwt = async (
  jwtString: string,
  jwtType: 'oAuth2Token' | 'idToken',
  jwtVerificationOptions?: {
    ignoreExpiration?: boolean;
  }
): Promise<any> => {
  const jwks = await getOidcKeystore();
  if (jwtType == 'oAuth2Token')
    return jwt.verify(jwtString, OAUTH2_JWT_SECRET, {
      issuer: 'https://id.caumd.club',
      ignoreExpiration:
        jwtVerificationOptions?.ignoreExpiration || false,
    });
  else
    return JWT.verify(jwtString, jwks, {
      issuer: 'https://id.caumd.club',
      ignoreExp:
        jwtVerificationOptions?.ignoreExpiration || false,
    });
};
