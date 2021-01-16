import {
  arg,
  extendType,
  intArg,
  nonNull,
  stringArg,
} from 'nexus';

export const signUp_verifyMembershipMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.string('signUp_verifyMembership', {
      description:
        '아이디 생성에 앞서 회원여부를 확인합니다. 회원이 존재할 경우 회원여부 인증 토큰을 반환하고, 존재하지 않는 경우 null을 반환합니다.',
      args: {
        studentId: intArg({ description: '학번' }),
        phoneNumber: nonNull(
          arg({
            type: 'TelephoneNumber',
            description: '전화번호',
          })
        ),
        name: nonNull(
          stringArg({ description: '회원의 이름' })
        ),
      },
      async resolve(
        src,
        { studentId, phoneNumber, name },
        ctx
      ) {
        const member = await ctx.db.member.findFirst({
          where: {
            studentId,
            phoneNumber,
            name,
          },
        });

        if (member === null) return null;

        if (
          (await ctx.db.sSOUser.findUnique({
            where: {
              memberId: member.id,
            },
          })) !== null
        )
          throw new Error('아이디가 이미 존재합니다.');

        const code = await ctx.db.code.create({
          data: {
            expiresAt: new Date(
              Date.now() + 1000 * 60 * 10
            ),
            data: {
              memberId: member.id,
              name,
            },
            id: '', // Not used
            usage: 'MembershipVerification',
          },
        });

        return code.code;
      },
    });
  },
});
