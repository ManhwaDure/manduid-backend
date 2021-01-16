import { extendType, list, nonNull } from 'nexus';

export const MembersQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('members', {
      type: nonNull(list(nonNull('Member'))),
      description: '회원들의 정보를 가져옵니다.',
      async resolve(parent, args, ctx) {
        return await ctx.db.member.findMany({});
      },
    });
  },
});
