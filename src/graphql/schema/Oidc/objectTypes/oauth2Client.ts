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
    t.nonNull.list.nonNull.string(
      'postLogoutRedirectUris',
      {
        description:
          'RP-Initated Logout이후 리다이렉트할 uri들',
      }
    );
    t.nonNull.list.nonNull.string('defaultAddedScopes', {
      description:
        '요청에 상관없이 자동으로 추가되는 scope들',
    });
    t.nonNull.boolean('returnPermissionsAsObject', {
      description:
        'permissions claim을 배열이 아닌 {[key: string]: true} 형태로 반환할지의 여부',
    });
    t.string('backchannelLogoutUri', {
      description:
        'Backchannel Logout 요청을 받을 주소, 미지원시 null',
    });
  },
});
