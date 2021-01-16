import { extendType } from 'nexus';

export const MeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('me', {
      type: 'Member',
      description: '자기자신의 정보를 조회합니다.',
      async resolve(parents, args, ctx) {
        return await ctx.db.member.findUnique({
          where: {
            id: ctx.user.memberId,
          },
        });
      },
    });
  },
});
