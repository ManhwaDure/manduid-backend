import { extendType, idArg, nonNull } from 'nexus';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const deleteOAuth2Client = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('deleteOAuth2Client', {
      type: 'OAuth2Client',
      description: '특정 OAuth2 Client를 삭제합니다.',
      args: {
        id: nonNull(
          idArg({
            description: '삭제할 OAuth2 Client의 고유 ID',
          })
        ),
      },
      async resolve(_parent, { id }, ctx) {
        const client = await ctx.db.oauth2Client.delete({
          where: {
            id,
          },
        });

        return transformOAuth2Client(client);
      },
    });
  },
});
