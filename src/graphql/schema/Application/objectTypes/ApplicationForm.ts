import { objectType } from 'nexus';

export const ApplicationForm = objectType({
  name: 'ApplicationForm',
  description: '입부원서입니다.',
  definition(t) {
    t.nonNull.id('applicationId', {
      description: '입부원서의 ID',
    });
    t.nonNull.boolean('reApplication', {
      description: '재입부원서 여부',
    });
    t.nonNull.string('name', { description: '이름' });
    t.nonNull.string('department', { description: '학과' });
    t.nonNull.int('studentId', { description: '학번' });
    t.nonNull.tel('phoneNumber', {
      description: '핸드폰 전화번호',
    });
    t.nonNull.date('birthday', { description: '생일' });
    t.nonNull.date('applicationDate', {
      description: '입부원서 제출일시',
    });
    t.field('acceptance', {
      type: 'ApplicationAcceptance',
      description:
        '입부원서 허가내역 (승인이나 거절이 이루어지지 않은 경우 null)',
      async resolve({ applicationId }, _, ctx) {
        const acceptance = await ctx.db.applicationAcceptance.findUnique(
          {
            where: {
              applicationId,
            },
          }
        );

        return acceptance;
      },
    });
    t.nonNull.list.nonNull.field('additionalAnswers', {
      type: 'ApplicationFormAdditionalAnswer',
      description: '추가질문에 대한 답변들',
      async resolve({ applicationId }, _args, ctx) {
        return await ctx.db.applicationFormAdditionalAnswer.findMany(
          {
            where: {
              applicationId,
            },
            select: {
              question: {
                select: {
                  id: true,
                  required: true,
                  question: true,
                },
              },
              applicationId: true,
              answer: true,
            },
          }
        );
      },
    });
  },
});
