import { extendType } from 'nexus';

export const executiveTypes = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('executiveTypes', {
      type: 'ExecutiveType',
      description: '집행부 직책들의 목록을 가져옵니다',
      async resolve(_, __, ctx) {
        return await ctx.db.executiveType.findMany();
      },
    });
  },
});
