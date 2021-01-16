import { extendType, nonNull, stringArg } from 'nexus';

export const renameExecutiveTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('renameExecutiveType', {
      description: '집행부 직책의 이름을 바꿉니다.',
      type: 'ExecutiveType',
      args: {
        oldName: nonNull(
          stringArg({
            description: '변경하고자 하는 집행부 직책 이름',
          })
        ),
        newName: nonNull(
          stringArg({
            description:
              '새로 쓰고자 하는 집행부 직책 이름',
          })
        ),
      },
      async resolve(_, { oldName, newName }, ctx) {
        if (
          (await ctx.db.executiveType.findUnique({
            where: { name: oldName },
          })) === null
        )
          throw new Error('존재하지 않는 직책입니다.');
        else if (
          (await ctx.db.executiveType.findUnique({
            where: { name: newName },
          })) !== null
        )
          throw new Error('이미 중복되는 직책 이름입니다.');

        await ctx.db.executiveType.update({
          where: {
            name: oldName,
          },
          data: {
            name: newName,
          },
        });

        return await ctx.db.executiveType.findUnique({
          where: {
            name: newName,
          },
        });
      },
    });
  },
});
