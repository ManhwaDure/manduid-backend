import {
  extendType,
  list,
  nonNull,
  stringArg,
} from 'nexus';
import randomString from 'random-string';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const createOAuth2Client = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createOAuth2Client', {
      type: 'OAuth2Client',
      description: 'OAuth2 Client를 생성합니다.',
      args: {
        name: nonNull(
          stringArg({ description: 'Client 이름' })
        ),
        redirectUris: nonNull(
          list(
            nonNull(
              stringArg({
                description: '허용할 redirect uri들',
              })
            )
          )
        ),
        allowedScopes: nonNull(
          list(
            nonNull(
              stringArg({ description: '허용할 scope들' })
            )
          )
        ),
      },
      async resolve(
        _parent,
        { name, redirectUris, allowedScopes },
        ctx
      ) {
        const client = await ctx.db.oauth2Client.create({
          data: {
            secret: randomString({ length: 70 }),
            name,
            redirectUris: redirectUris.join('\n'),
            allowedScopes: allowedScopes.join(' '),
          },
        });

        return transformOAuth2Client(client);
      },
    });
  },
});
