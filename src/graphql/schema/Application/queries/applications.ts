import { extendType } from 'nexus';

export const applications = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('applications', {
      type: 'ApplicationForm',
      description:
        '모든 입부원서를 허가여부에 상관없이 가져옵니다.',
      async resolve(parent, args, ctx) {
        return await ctx.db.applicationForm.findMany({
          where: {},
        });
      },
    });
  },
});
