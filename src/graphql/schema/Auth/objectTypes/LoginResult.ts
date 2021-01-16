import { objectType } from 'nexus';

export const LoginResult = objectType({
  name: 'LoginResult',
  description: '로그인 결과입니다.',
  definition(t) {
    t.nonNull.boolean('success', {
      description: '로그인 성공 여부',
    });
    t.string('token', { description: '인증 토큰' });
    t.string('errorMessage', {
      description: '오류 메세지',
    });
  },
});
