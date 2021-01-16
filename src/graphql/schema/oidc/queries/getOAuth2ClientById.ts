import { extendType, idArg, nonNull } from 'nexus';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const getOAuth2ClientById = extendType({
  type: 'Query',
  definition(t) {
    t.field('getOAuth2ClientById', {
      type: 'OAuth2Client',
      description:
        'client_id로 OAuth2 Client를 가져옵니다.',
      args: {
        id: nonNull(
          idArg({ description: '정보를 조회할 client_id' })
        ),
      },
      async resolve(_parent, { id }, ctx) {
        const result = await ctx.db.oauth2Client.findUnique(
          { where: { id } }
        );
        return transformOAuth2Client(result);
      },
    });
  },
});
