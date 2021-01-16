import { objectType } from 'nexus';

export const UserProfile = objectType({
  name: 'UserProfile',
  description: '회원의 프로필을 나타냅니다.',
  definition(t) {
    t.string('introduction', { description: '자기소개' });
    t.string('website', { description: '웹사이트' });
    t.string('nickname', { description: '닉네임' });
    t.nonNull.boolean('hasCustomAvatar', {
      description: '커스텀 아바타가 있는 지의 여부',
    });
  },
});
