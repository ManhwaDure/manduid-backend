import { extendType, nonNull, stringArg } from 'nexus';

export const getApplicationById = extendType({
  type: 'Query',
  definition(t) {
    t.field('getApplicationById', {
      type: 'ApplicationForm',
      description:
        '입부원서 ID로 입부원서를 가져옵니다. 없을 시 null을 반환합니다.',
      args: {
        applicationId: nonNull(
          stringArg({ description: '가져올 입부원서의 ID' })
        ),
      },
      async resolve(_, { applicationId }, ctx) {
        return await ctx.db.applicationForm.findUnique({
          where: {
            applicationId,
          },
        });
      },
    });
  },
});
