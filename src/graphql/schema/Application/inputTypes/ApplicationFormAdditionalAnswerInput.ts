import { inputObjectType } from 'nexus';

export const ApplicationFormAdditionalAnswerInput = inputObjectType(
  {
    name: 'ApplicationFormAdditionalAnswerInput',
    description:
      '입부원서 제출시 추가질문을 같이 제출하기 위한 입력 타입입니다.',
    definition(t) {
      t.nonNull.id('questionId', {
        description: '추가질문의 ID',
      });
      t.string('answer', {
        description: '추가질문에 대한 답변',
      });
    },
  }
);
