import { booleanArg, extendType } from 'nexus';
import { lockApplicationConfigKey } from '../isApplicationAccepting';

export const LockApplicationMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('lockApplication', {
      args: {
        lock: booleanArg({
          description: '입부원서를 받지 않을 지의 여부',
        }),
      },
      description:
        '입부원서를 받지 않을 지의 여부, 미설정시 기본값은 false로 간주됩니다.\nfalse로 설정될 시 입부원서 제출 시작/종료일을 따르며 (시작/종료일 미설정시 상시모집으로 간주됨), true로 설정될 시 설정된 입부원서 제출 시작/종료일에 관계없이 입부원서를 거부한다.',
      async resolve(
        _parent,
        { lock }: { lock: boolean },
        ctx
      ) {
        await ctx.db.configuration.upsert({
          where: {
            id: lockApplicationConfigKey,
          },
          create: {
            id: lockApplicationConfigKey,
            value: JSON.stringify(lock),
          },
          update: {
            value: JSON.stringify(lock),
          },
        });

        return lock;
      },
    });
  },
});
