import { inputObjectType } from 'nexus';

export const UserProfileInput = inputObjectType({
  name: 'UserProfileInput',
  description:
    'SSO 프로필을 수정할 때 쓰는 입력 타입입니다.',
  definition(t) {
    t.string('introduction', { description: '자기소개' });
    t.string('website', { description: '웹사이트' });
    t.string('nickname', { description: '닉네임' });
  },
});
