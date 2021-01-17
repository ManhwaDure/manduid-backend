import {
  extendType,
  idArg,
  list,
  nonNull,
  stringArg,
} from 'nexus';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const updateOAuth2Client = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateOAuth2Client', {
      type: 'OAuth2Client',
      description:
        'OAuth2 Client의 정보를 수정합니다. null인 매개변수들은 수정되지 않습니다.',
      args: {
        id: nonNull(
          idArg({
            description:
              '수정하고자 하는 OAuth2 Client의 고유 ID',
          })
        ),
        name: stringArg({ description: '이름' }),
        redirectUris: list(
          nonNull(
            stringArg({
              description: '허용할 리다이렉트 URL',
            })
          )
        ),
        allowedScopes: list(
          nonNull(
            stringArg({ description: '허용할 scope들' })
          )
        ),
      },
      async resolve(
        _parent,
        { id, name, redirectUris, allowedScopes },
        ctx
      ) {
        const data: {
          name?: string;
          redirectUris?: string;
          allowedScopes?: string;
        } = {};

        if (name !== null) data.name = name;
        if (redirectUris !== null)
          data.redirectUris = redirectUris.join('\n');
        if (allowedScopes !== null)
          data.allowedScopes = allowedScopes.join(' ');
        const client = await ctx.db.oauth2Client.update({
          where: {
            id,
          },
          data,
        });

        return transformOAuth2Client(client);
      },
    });
  },
});
