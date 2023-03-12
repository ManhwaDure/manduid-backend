import { extendType } from 'nexus';
import { Permission } from '../../../context/permissions';

export const permissionDescriptions: {
  [key in Permission]: string;
} = {
  application: '입부/재입부원서에 관한 모든 권한',
  'application.accept':
    '입부/재입부원서를 승인할 수 있는 권한',
  'application.deny':
    '입부/재입부원서를 거부할 수 있는 권한',
  'application.read':
    '입부/재입부원서를 조회하고 열람할 수 있는 권한',
  'application.setPeroid':
    '입부/재입부원서 제출기간을 설정할 수 있는 권한',
  'application.lock':
    '입부/재입부원서 제출을 더 이상 받지 않도록 설정할 수 있는 권한',
  executive: '집행부원이나 집행부원 직책에 관한 모든 권한',
  'executive.appoint': '집행부원을 선임할 수 있는 권한',
  'executive.disappoint': '집행부원을 해임할 수 있는 권한',
  'executive.list': '집행부원 목록을 조회할 수 있는 권한',
  'executive.type': '집행부원 직책에 관한 모든 권한',
  'executive.type.create':
    '집행부원 직책을 생성할 수 있는 권한',
  'executive.type.get':
    '집행부원 직책을 조회할 수 있는 권한',
  'executive.type.remove':
    '집행부원 직책을 삭제할 수 있는 권한',
  'executive.type.rename':
    '집행부원 직책의 이름을 변경할 수 있는 권한',
  'executive.type.update':
    '집행부원 직책의 시스템 권한을 변경할 수 있는 권한',
  roll: '회원명부에 관한 모든 권한',
  'roll.create': '회원명부에 회원을 추가할 수 있는 권한',
  'roll.list': '회원명부를 조회할 수 있는 권한',
  'roll.update': '회원명부를 수정할 수 있는 권한',
  'roll.updateProfile':
    '특정 회원의 프로필을 수정할 수 있는 권한',
  root: '모든 권한',
  subscription: '이메일 구독에 관한 모든 권한',
  'subscription.create':
    '이메일 구독을 생성할 수 있는 권한',
  'subscription.list': '이메일 구독 목록을 볼 수 있는 권한',
  'subscription.remove':
    '이메일 구독을 삭제할 수 있는 권한',
  'application.additionalQuestion':
    '입부/재입부원서 추가 질문에 관한 모든 권한',
  'application.additionalQuestion.create':
    '입부/재입부원서 추가 질문을 생설할 수 있는 권한',
  'application.additionalQuestion.delete':
    '입부/재입부원서 추가 질문을 삭제할 수 있는 권한',
  oidc: 'OpenID Connect에 관련된 모든 권한',
  'oidc.create':
    'OpenID Connect Client를 생성할 수 있는 권한',
  'oidc.delete':
    'OpenID Connect Client를 삭제할 수 있는 권한',
  'oidc.list':
    'OpenID Connect Client를 조회할 수 있는 권한',
  'oidc.renewSecret':
    'OpenID Connect Client의 client secret을 재성성할 수 있는 권한',
  'oidc.update':
    'OpenID Connect Client를 수정할 수 있는 권한',
  homepage: '동아리 소개 홈페이지를 수정할 수 있는 권한',
};

export const PermissionsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('permissionDescriptions', {
      type: 'PermissionDescription',
      description:
        '모든 시스템 권한들에 대한 설명을 가져옵니다.',
      resolve(_parent, args, ctx) {
        const result = [];
        for (const permission in permissionDescriptions) {
          result.push({
            name: permission,
            description:
              permissionDescriptions[
                permission as Permission
              ],
          });
        }
        return result;
      },
    });
  },
});
