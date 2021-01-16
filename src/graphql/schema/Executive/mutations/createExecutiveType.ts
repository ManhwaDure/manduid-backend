import { extendType, nonNull, stringArg } from 'nexus';

export const createExecutiveTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createExecutiveType', {
      type: 'ExecutiveType',
      description:
        '새로운 이름의 집행부 직책을 생성합니다.',
      args: {
        name: nonNull(
          stringArg({
            description: '새로 만들 집행부 직책명',
          })
        ),
      },
      async resolve(_, { name }, ctx) {
        if (
          (await ctx.db.executiveType.findUnique({
            where: { name },
          })) !== null
        )
          throw new Error(
            '동일한 이름의 직책이 이미 존재합니다.'
          );

        return await ctx.db.executiveType.create({
          data: {
            name,
          },
        });
      },
    });
  },
});
