import { extendType, intArg, nonNull } from 'nexus';
import {
  applicationBeginDateConfigKey,
  applicationEndDateConfigKey,
} from '../isApplicationAccepting';

export const SetApplicationPeroidMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('setApplicationPeroid', {
      args: {
        begin: intArg({
          description:
            '입부원서 제출 시작일, ms 단위의 유닉스 타임스탬프 형식이다.',
        }),
        end: intArg({
          description:
            '입부원서 제출 종료일, ms 단위의 유닉스 타임스탬프 형식이다.',
        }),
      },
      description:
        '입부원서 제출 기간을 설정합니다. 시작일과 종료일이 둘 다 없을 시 상시모집으로 운영됩니다.',
      async resolve(
        _parent,
        { begin, end }: { begin: number; end: number },
        ctx
      ) {
        if (begin === null) {
          await ctx.db.configuration.delete({
            where: {
              id: applicationBeginDateConfigKey,
            },
          });
        } else {
          await ctx.db.configuration.upsert({
            where: {
              id: applicationBeginDateConfigKey,
            },
            create: {
              id: applicationBeginDateConfigKey,
              value: JSON.stringify(begin),
            },
            update: {
              value: JSON.stringify(begin),
            },
          });
        }

        if (end === null) {
          await ctx.db.configuration.delete({
            where: {
              id: applicationEndDateConfigKey,
            },
          });
        } else {
          await ctx.db.configuration.upsert({
            where: {
              id: applicationEndDateConfigKey,
            },
            create: {
              id: applicationEndDateConfigKey,
              value: JSON.stringify(end),
            },
            update: {
              value: JSON.stringify(end),
            },
          });
        }

        return true;
      },
    });
  },
});
