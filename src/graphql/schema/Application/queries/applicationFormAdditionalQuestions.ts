import { extendType } from 'nexus';

export const applicationFormAdditionalQuestionsQuery = extendType(
  {
    type: 'Query',
    definition(t) {
      t.nonNull.list.nonNull.field(
        'applicationFormAdditionalQuestions',
        {
          type: 'ApplicationFormAdditionalQuestion',
          description:
            '입부원서와 함께 제출하는 추가질문들입니다.',
          async resolve(_parent, _args, ctx) {
            return await ctx.db.applicationFormAdditionalQuestion.findMany(
              {
                where: {
                  deleted: false,
                },
                select: {
                  id: true,
                  question: true,
                  required: true,
                },
              }
            );
          },
        }
      );
    },
  }
);
