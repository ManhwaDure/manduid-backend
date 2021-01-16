import bcrypt from 'bcrypt';
import { extendType, nonNull, stringArg } from 'nexus';

export const changePasswordMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.boolean('changePassword', {
      description:
        '현재 로그인하고 있는 회원의 비밀번호를 변경합니다.',
      args: {
        oldPassword: nonNull(
          stringArg({
            description: '현재 사용중인 비밀번호',
          })
        ),
        newPassword: nonNull(
          stringArg({
            description: '새로 이용하고자 하는 비밀번호',
          })
        ),
      },
      async resolve(
        src,
        { oldPassword, newPassword },
        ctx
      ) {
        const {
          password: oldPasswordHashed,
        } = await ctx.db.sSOUser.findUnique({
          where: {
            id: ctx.user.ssoUserId,
          },
          select: {
            password: true,
          },
        });

        if (
          await bcrypt.compare(
            oldPassword,
            oldPasswordHashed
          )
        )
          await ctx.db.sSOUser.update({
            where: {
              id: ctx.user.ssoUserId,
            },
            data: {
              password: await bcrypt.hash(
                newPassword,
                await bcrypt.genSalt()
              ),
            },
          });
        else return false;

        return true;
      },
    });
  },
});
