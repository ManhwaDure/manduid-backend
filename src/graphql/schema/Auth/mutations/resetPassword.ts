import bcrypt from 'bcrypt';
import { extendType, nonNull, stringArg } from 'nexus';

export const resetPasswordMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('resetPassword', {
      description:
        '비밀번호 재설정 메일 토큰을 이용해 비밀번호를 재설정합니다. 성공시 true를, 토큰 미존재시 false를 반환합니다.',
      args: {
        resetToken: nonNull(
          stringArg({
            description:
              '비밀번호 재설정 메일에 포함된 토큰',
          })
        ),
        newPassword: nonNull(
          stringArg({ description: '새로 사용할 비밀번호' })
        ),
      },
      async resolve(_, { resetToken, newPassword }, ctx) {
        const token = await ctx.db.code.findUnique({
          where: {
            code: resetToken,
          },
        });

        if (token === null) return false;
        else if (token.usage !== 'PasswordRecovery')
          return false;
        else if (token.expiresAt < new Date()) return false;
        else if (newPassword.length < 5)
          throw new Error(
            '비밀번호는 최소 5글자 이상이어야 합니다.'
          );

        await ctx.db.sSOUser.update({
          where: {
            emailAddress: (token.data as any).emailAddress,
          },
          data: {
            password: await bcrypt.hash(
              newPassword,
              await bcrypt.genSalt()
            ),
          },
        });

        return true;
      },
    });
  },
});
