import {
  booleanArg,
  extendType,
  intArg,
  nonNull,
} from 'nexus';

export const handoverPresidentMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('handoverPresident', {
      args: {
        memberId: nonNull(
          intArg({
            description:
              '회장직을 인수인계받을 회원의 회원ID',
          })
        ),
        disappointAllExecutives: nonNull(
          booleanArg({
            default: true,
            description:
              '인수인계 전에 모든 집행부원을 해임할 지의 여부',
          })
        ),
        unsubscribeAll: nonNull(
          booleanArg({
            default: true,
            description:
              '인수인계 전에 모든 구독들을 해제할 지의 여부',
          })
        ),
      },
      description: '회장직을 인수인계합니다.',
      async resolve(
        _,
        {
          memberId,
          disappointAllExecutives,
          unsubscribeAll,
        },
        ctx
      ) {
        const nextPresident = await ctx.db.member.findUnique(
          {
            where: {
              id: memberId,
            },
          }
        );

        if (nextPresident === null)
          throw new Error(
            '학번이나 이름을 잘못 입력하셨습니다.'
          );

        if (disappointAllExecutives) {
          await ctx.db.member.updateMany({
            where: {
              isExecutive: true,
            },
            data: {
              isExecutive: false,
            },
          });
        }

        if (unsubscribeAll) {
          await ctx.db.subscription.deleteMany({
            where: {},
          });
        }

        await ctx.db.member.update({
          where: {
            id: ctx.user.memberId,
          },
          data: {
            isPresident: false,
          },
        });

        await ctx.db.member.update({
          where: {
            id: nextPresident.id,
          },
          data: {
            isExecutive: false,
            isPresident: true,
          },
        });

        return true;
      },
    });
  },
});
