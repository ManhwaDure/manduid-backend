import { extendType } from 'nexus';
import {
  applicationBeginDateConfigKey,
  applicationEndDateConfigKey,
  ApplicationNonAcceptingPeroidReason,
  isApplicationAcceptingPeroid,
} from '../isApplicationAccepting';

export const applicationBeginDate = extendType({
  type: 'Query',
  definition(t) {
    t.int('applicationsBeginDate', {
      description:
        '입부원서/재입부원서 접수 시작일입니다. ms 단위의 유닉스 타임스탬프 형식입니다.',
      async resolve(parent, args, ctx) {
        const beginDate = await ctx.db.configuration.findFirst(
          {
            where: {
              id: applicationBeginDateConfigKey,
            },
          }
        );

        return JSON.parse(beginDate?.value ?? 'null');
      },
    });
  },
});

export const applicationEndDate = extendType({
  type: 'Query',
  definition(t) {
    t.int('applicationsEndDate', {
      description:
        '입부원서/재입부원서 접수 종료일입니다. ms 단위의 유닉스 타임스탬프 형식입니다.',
      async resolve(parent, args, ctx) {
        const beginDate = await ctx.db.configuration.findFirst(
          {
            where: {
              id: applicationEndDateConfigKey,
            },
          }
        );

        return JSON.parse(beginDate?.value ?? 'null');
      },
    });
  },
});
