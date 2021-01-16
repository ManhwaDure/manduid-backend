import { extendType } from 'nexus';

export const SubscriptionsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('subscriptions', {
      type: 'Subscription',
      description: '구독들을 가져옵니다.',
      async resolve(_parent, _args, ctx) {
        return await ctx.db.subscription.findMany();
      },
    });
  },
});
