import {
  extendType,
  intArg,
  nonNull,
  stringArg,
} from 'nexus';

export const getMemberByStudentIdQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getMemberByStudentId', {
      type: 'Member',
      description:
        '학번으로 회원에 대한 정보를 가져옵니다. 이름과 함께 호출할 시 이름도 확인합니다.',
      args: {
        studentId: nonNull(intArg({ description: '학번' })),
        name: stringArg({
          description: '이름 (null일시 이름 확인하지 않음)',
        }),
      },
      async resolve(parent, { studentId, name }, ctx) {
        const member = await ctx.db.member.findFirst({
          where: {
            studentId,
          },
        });
        if (name === null || member?.name === name)
          return member;
        else return null;
      },
    });
  },
});
