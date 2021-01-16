import { extendType } from 'nexus';

export const executives = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('executives', {
      type: 'Member',
      description: '집행부원들의 목록을 가져옵니다.',
      async resolve(_, __, ctx) {
        return await ctx.db.member.findMany({
          where: {
            isExecutive: true,
          },
        });
      },
    });
  },
});
