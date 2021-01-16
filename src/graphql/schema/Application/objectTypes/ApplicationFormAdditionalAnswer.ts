import { objectType } from 'nexus';

export const ApplicationFormAdditionalAnswer = objectType({
  name: 'ApplicationFormAdditionalAnswer',
  description: '추가질문에 대한 답변입니다.',
  definition(t) {
    t.string('answer', { description: '답변' });
    t.nonNull.string('applicationId', {
      description: '추가질문의 ID',
    });
    t.field('question', {
      description: '답변받은 추가질문',
      type: 'ApplicationFormAdditionalQuestion',
    });
  },
});
