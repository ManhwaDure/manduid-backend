import { extendType } from 'nexus';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const oauth2Clients = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('oauth2Clients', {
      type: 'OAuth2Client',
      description: 'OAuth2 Client들을 가져옵니다.',
      async resolve(_parent, _args, ctx) {
        const result = await ctx.db.oauth2Client.findMany();
        return result.map(transformOAuth2Client);
      },
    });
  },
});
