import { extendType, nonNull, stringArg } from 'nexus';

export const resendVerificationEmailMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.string('resendVerificationEmail', {
      description: '인증 이메일을 재전송합니다.',
      args: {
        token: nonNull(
          stringArg({
            description: '이메일 재전송 토큰',
          })
        ),
      },
      async resolve(_, { token }, ctx) {
        const resendToken = await ctx.db.code.findUnique({
          where: {
            code: token,
          },
        });

        if (
          resendToken === null ||
          resendToken.usage !== 'ResendEmailVerification'
        )
          throw new Error('잘못된 토큰입니다.');
        else if (resendToken.expiresAt < new Date())
          throw new Error('만료된 토큰입니다.');

        const oldToken = await ctx.db.code.findUnique({
          where: {
            code: (resendToken.data as any).token as string,
          },
        });
        const newToken = await ctx.db.code.create({
          data: {
            expiresAt: new Date(
              Date.now() + 1000 * 60 * 30
            ),
            data: oldToken.data,
            id: '',
            usage: oldToken.usage,
          },
        });

        await ctx.db.code.update({
          where: {
            code: resendToken.code,
          },
          data: {
            data: {
              token: newToken.code,
            },
            expiresAt: new Date(
              Date.now() + 1000 * 60 * 30
            ),
          },
        });

        const { name, emailAddress } = newToken.data as any;
        await ctx.sendEmail(
          emailAddress,
          name,
          'VerificationEmail',
          {
            token: newToken.code,
          }
        );

        return resendToken.code;
      },
    });
  },
});
