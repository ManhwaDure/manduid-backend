import { extendType, idArg, nonNull } from 'nexus';
import randomString from 'random-string';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const renewOAuth2ClientSecret = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('renewOAuth2ClientSecret', {
      description:
        '특정 OAuth2 Client의 client_secret을 갱신합니다.',
      type: 'OAuth2Client',
      args: {
        id: nonNull(
          idArg({
            description:
              'client_secret을 갱신할 OAuth2 Client의 고유 ID',
          })
        ),
      },
      async resolve(_parent, { id }, ctx) {
        const client = await ctx.db.oauth2Client.update({
          where: {
            id,
          },
          data: {
            secret: randomString({ length: 70 }),
          },
        });

        return transformOAuth2Client(client);
      },
    });
  },
});
