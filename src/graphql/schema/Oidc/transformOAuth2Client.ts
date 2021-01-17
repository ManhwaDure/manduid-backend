import { oauth2Client } from '@prisma/client';

export const transformOAuth2Client: (
  client: oauth2Client
) => {
  id: string;
  secret: string;
  name: string;
  redirectUris: string[];
  allowedScopes: string[];
} = (client) => {
  if (client === null) return null;
  return {
    id: client.id,
    secret: client.secret,
    name: client.name,
    redirectUris: client.redirectUris.split('\n'),
    allowedScopes: client.allowedScopes.split(' '),
  };
};
