import { Prisma } from '@prisma/client';
import {
  extendType,
  list,
  nonNull,
  stringArg
} from 'nexus';

export const updatePermissionMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updatePermission', {
      type: 'ExecutiveType',
      description:
        '특정 집행부 직책에 부여된 권한 목록을 수정합니다',
      args: {
        executiveTypeName: nonNull(
          stringArg({ description: '집행부 직책 이름' })
        ),
        permissions: nonNull(
          list(
            nonNull(stringArg({ description: '권한 목록' }))
          )
        ),
      },
      async resolve(
        _,
        { executiveTypeName, permissions },
        ctx
      ) {
        const actions: Prisma.PrismaPromise<any>[] = [];
        actions.push(
          ctx.db.permission.deleteMany({
            where: {
              executiveTypeName,
            },
          })
        );
        for (const permission of permissions)
          actions.push(
            ctx.db.permission.create({
              data: {
                executiveType: {
                  connect: {
                    name: executiveTypeName,
                  },
                },
                permission: permission,
              },
            })
          );

        await ctx.db.$transaction(actions);

        return await ctx.db.executiveType.findUnique({
          where: {
            name: executiveTypeName,
          },
        });
      },
    });
  },
});
