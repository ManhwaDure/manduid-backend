import { extendType, nonNull, stringArg } from 'nexus';

export const deleteExecutiveTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('deleteExecutiveType', {
      description: '집행부 직책을 삭제합니다.',
      args: {
        name: nonNull(
          stringArg({ description: '삭제할 집행부 직책명' })
        ),
      },
      async resolve(_, { name }, ctx) {
        await ctx.db.executiveType.delete({
          where: {
            name,
          },
        });

        return true;
      },
    });
  },
});
