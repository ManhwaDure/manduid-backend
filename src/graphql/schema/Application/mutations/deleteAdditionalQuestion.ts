import { extendType, idArg, nonNull } from 'nexus';

export const deleteApplicationFormAdditionalQuestionMutation = extendType(
  {
    type: 'Mutation',
    definition(t) {
      t.field('deleteApplicationFormAdditionalQuestion', {
        type: 'ApplicationFormAdditionalQuestion',
        description:
          '추가질문을 삭제합니다. 추가질문을 삭제해도 답변들은 보존합니다.',
        args: {
          id: nonNull(
            idArg({
              description: '삭제할 추가질문의 ID',
            })
          ),
        },
        async resolve(_parent, { id }, ctx) {
          return await ctx.db.applicationFormAdditionalQuestion.update(
            {
              where: {
                id,
              },
              data: {
                deleted: true,
              },
              select: {
                id: true,
                question: true,
                required: true,
              },
            }
          );
        },
      });
    },
  }
);
