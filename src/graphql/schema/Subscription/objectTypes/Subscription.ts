import { objectType } from 'nexus';

export const Subscription = objectType({
  name: 'Subscription',
  description: '구독을 나타냅니다.',
  definition(t) {
    t.nonNull.int('subscriptorId', {
      description: '이 구독의 고유 ID',
    });
    t.nonNull.field('target', {
      description: '구독 대상',
      type: 'SubscriptionTarget',
    });
    t.nonNull.field('method', {
      description: '구독 방법',
      type: 'SubscriptionMethod',
    });
    t.nonNull.field('subscriptor', {
      type: 'Member',
      description: '구독하는 회원',
      async resolve({ subscriptorId }, _args, ctx) {
        return await ctx.db.member.findUnique({
          where: {
            id: subscriptorId,
          },
        });
      },
    });
  },
});
