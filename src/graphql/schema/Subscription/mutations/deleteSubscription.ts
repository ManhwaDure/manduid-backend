import { arg, extendType, intArg, nonNull } from 'nexus';

export const deleteSubscription = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteSubscription', {
      type: 'Subscription',
      description: '구독을 삭제합니다.',
      args: {
        subscriptorId: nonNull(
          intArg({ description: '구독받는 회원의 회원ID' })
        ),
        target: nonNull(
          arg({
            type: 'SubscriptionTarget',
            description: '구독할 대상',
          })
        ),
        method: nonNull(
          arg({
            type: 'SubscriptionMethod',
            description: '구독 방법',
          })
        ),
      },
      async resolve(
        _parent,
        { subscriptorId, target, method },
        ctx
      ) {
        return await ctx.db.subscription.delete({
          where: {
            subscriptorId_target_method: {
              method,
              target,
              subscriptorId,
            },
          },
        });
      },
    });
  },
});
