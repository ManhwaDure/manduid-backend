import { objectType } from 'nexus';

export const ExecutiveType = objectType({
  name: 'ExecutiveType',
  description: '집행부 직책을 나타냅니다.',
  definition(t) {
    t.nonNull.string('name', { description: '직책 이름' });
    t.nonNull.list.nonNull.string('permissions', {
      description: '이 직책에 부여된 시스템 권한들',
      async resolve({ name }, _, ctx) {
        const permissions = await ctx.db.permission.findMany(
          {
            where: {
              executiveTypeName: name,
            },
          }
        );

        return permissions.map((i) => i.permission);
      },
    });
  },
});
