import { objectType } from 'nexus';

export const ApplicationFormAdditionalQuestion = objectType(
  {
    name: 'ApplicationFormAdditionalQuestion',
    description: '입부원서와 함께 나타나는 추가질문입니다.',
    definition(t) {
      t.nonNull.id('id', { description: '추가질문 ID' });
      t.nonNull.string('question', {
        description: '질문내용',
      });
      t.nonNull.boolean('required', {
        description: '필수여부',
      });
    },
  }
);
