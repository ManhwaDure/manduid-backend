import { extendType, nonNull, stringArg } from 'nexus';
import getAvatarUrl from '../getAvatarUrl';

export const getAvatarUrlQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.string('getAvatarUrl', {
      description:
        '아이디를 받고 해당하는 아바타 이미지 주소를 반환합니다. 업로드된 아바타가 없을 시 Gravatar 이미지 주소를 반환합니다.',
      args: {
        ssoUserId: nonNull(
          stringArg({
            description:
              '아바타 이미지 주소를 조회할 아이디',
          })
        ),
      },
      async resolve(_, { ssoUserId }, ctx) {
        return await getAvatarUrl(ssoUserId, ctx.db);
      },
    });
  },
});
