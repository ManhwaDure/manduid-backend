import { objectType } from 'nexus';

export const ApplicationAcceptance = objectType({
  name: 'ApplicationAcceptance',
  description: '입부원서의 허가내역입니다.',
  definition(t) {
    t.nonNull.id('applicationId', {
      description: '승인하거나 거절한 입부원서의 ID',
    });
    t.nonNull.int('accepterId', {
      description: '승인하거나 거절한 사람의 회원ID',
    });
    t.nonNull.boolean('accepted', {
      description: '승인여부 (false면 거절)',
    });
    t.nonNull.string('reason', {
      description: '승인 및 거절의 사유',
    });
    t.nonNull.date('acceptedAt', {
      description: '승인 및 거절한 일시',
    });
    t.nonNull.string('accepterName', {
      description: '승인 및 거절한 사람의 이름',
      async resolve({ accepterId }, _, ctx) {
        return (
          await ctx.db.member.findUnique({
            where: { id: accepterId },
          })
        ).name;
      },
    });
  },
});
