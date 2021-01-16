import {
  booleanArg,
  extendType,
  nonNull,
  stringArg,
} from 'nexus';

export const createApplicationFormAdditionalQuestionMutation = extendType(
  {
    type: 'Mutation',
    definition(t) {
      t.field('createApplicationFormAdditionalQuestion', {
        description: '추가질문을 생성합니다.',
        type: 'ApplicationFormAdditionalQuestion',
        args: {
          question: nonNull(
            stringArg({
              description: '생성할 추가질문의 질문 내용',
            })
          ),
          required: nonNull(
            booleanArg({
              description: '생성할 추가질문의 필수답변여부',
            })
          ),
        },
        async resolve(
          _parent,
          { question, required },
          ctx
        ) {
          return await ctx.db.applicationFormAdditionalQuestion.create(
            {
              data: {
                question,
                required,
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
