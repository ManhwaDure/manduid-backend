import { extendType, intArg } from 'nexus';

export const getMemberByIdQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getMemberById', {
      type: 'Member',
      description:
        '회원ID로 회원에 대한 정보를 가져옵니다.',
      args: {
        memberId: intArg({ description: '회원ID' }),
      },
      async resolve(parent, { memberId }, ctx) {
        return await ctx.db.member.findUnique({
          where: {
            id: memberId,
          },
        });
      },
    });
  },
});
