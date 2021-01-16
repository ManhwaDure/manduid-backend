import { objectType } from 'nexus';

export const permissionDescription = objectType({
  name: 'PermissionDescription',
  description: '시스템 권한에 대한 설명입니다.',
  definition(t) {
    t.nonNull.string('name', { description: '권한' });
    t.nonNull.string('description', {
      description: '설명',
    });
  },
});
