import { objectType } from 'nexus';

export const OAuth2Client = objectType({
  name: 'OAuth2Client',
  description: 'OAuth2 Client를 나타냅니다.',
  definition(t) {
    t.nonNull.id('id', {
      description:
        'client_id으로 이용되는 클라이언트 고유 ID',
    });
    t.nonNull.string('secret', {
      description: 'client_secret으로 이용되는 값',
    });
    t.nonNull.string('name', { description: '이름' });
    t.nonNull.list.string('redirectUris', {
      description: '허용된 redirect uri들',
    });
    t.nonNull.list.string('allowedScopes', {
      description: '허용된 scope들',
    });
  },
});
