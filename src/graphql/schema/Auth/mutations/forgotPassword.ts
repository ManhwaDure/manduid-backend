import { extendType, nonNull, stringArg } from 'nexus';

export const forgotPasswordMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('forgotPassword', {
      description:
        '비밀번호 재설정 메일을 보냅니다. 성공시 true를 반환하며, 해당 이메일 계정이 없을 시 false를 반환합니다.',
      args: {
        emailAddress: nonNull(
          stringArg({
            description: '회원가입시 이용한 이메일 주소',
          })
        ),
      },
      async resolve(_, { emailAddress }, ctx) {
        const user = await ctx.db.sSOUser.findUnique({
          where: {
            emailAddress,
          },
          include: {
            member: true,
          },
        });

        if (user === null) return false;

        const token = await ctx.db.code.create({
          data: {
            usage: 'PasswordRecovery',
            data: {
              userId: user.id,
            },
            expiresAt: new Date(
              Date.now() + 1000 * 60 * 30
            ),
            id: '',
          },
        });

        await ctx.sendEmail(
          user.emailAddress,
          user.member.name,
          'PasswordReset',
          {
            token: token.code,
          }
        );
        return true;
      },
    });
  },
});
