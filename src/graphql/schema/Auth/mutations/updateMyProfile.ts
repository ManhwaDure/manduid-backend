import { arg, extendType, nonNull } from 'nexus';

export const updateMyProfileMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateMyProfile', {
      type: 'UserProfile',
      description:
        '현재 로그인하고 있는 회원의 SSO 프로필을 수정합니다.',
      args: {
        profile: nonNull(
          arg({
            type: 'UserProfileInput',
            description: '새로 이용할 프로필',
          })
        ),
      },
      async resolve(src, { profile }, ctx) {
        await ctx.db.sSOUser.update({
          where: {
            id: ctx.user.ssoUserId,
          },
          data: profile,
        });

        const ssoUser = await ctx.db.sSOUser.findUnique({
          where: {
            id: ctx.user.ssoUserId,
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
