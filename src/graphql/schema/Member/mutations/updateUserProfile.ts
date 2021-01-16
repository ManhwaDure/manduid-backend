import { arg, extendType, nonNull, stringArg } from 'nexus';

export const updateUserProfileMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateUserProfile', {
      type: 'UserProfile',
      description:
        '다른 회원의 프로필을 강제로 변경합니다.',
      args: {
        ssoUserId: nonNull(
          stringArg({ description: '변경할 회원의 아이디' })
        ),
        profile: nonNull(
          arg({
            type: 'UserProfileInput',
            description: '새로운 프로필',
          })
        ),
      },
      async resolve(src, { ssoUserId, profile }, ctx) {
        let ssoUser = await ctx.db.sSOUser.findUnique({
          where: {
            id: ssoUserId,
          },
        });

        if (ssoUser === null)
          throw new Error('존재하지 않는 아이디입니다.');

        await ctx.db.sSOUser.update({
          where: {
            id: ssoUserId,
          },
          data: profile,
        });

        ssoUser = await ctx.db.sSOUser.findUnique({
          where: {
            id: ssoUserId,
          },
        });

        return {
          hasCustomAvatar: ssoUser.customAvatarTag !== null,
          introduction: ssoUser.introduction,
          nickname: ssoUser.nickname,
          website: ssoUser.website,
        };
      },
    });
  },
});
