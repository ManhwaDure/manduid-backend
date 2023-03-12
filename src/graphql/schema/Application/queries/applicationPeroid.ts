import { extendType } from 'nexus';
import {
  applicationBeginDateConfigKey,
  applicationEndDateConfigKey,
} from '../isApplicationAccepting';

export const applicationBeginDate = extendType({
  type: 'Query',
  definition(t) {
    t.string('applicationsBeginDate', {
      description:
        '입부원서/재입부원서 접수 시작일입니다. ISO 8601 형식의 문자열입니다.',
      async resolve(parent, args, ctx) {
        const beginDate = await ctx.db.configuration.findFirst(
          {
            where: {
              id: applicationBeginDateConfigKey,
            },
          }
        );

        const timestamp: number | null = JSON.parse(
          beginDate?.value ?? 'null'
        );
        if (timestamp) {
          return new Date(timestamp).toISOString();
        } else {
          return null;
        }
      },
    });
  },
});

export const applicationEndDate = extendType({
  type: 'Query',
  definition(t) {
    t.string('applicationsEndDate', {
      description:
        '입부원서/재입부원서 접수 종료일입니다. ISO 8601 형식의 문자열입니다.',
      async resolve(parent, args, ctx) {
        const beginDate = await ctx.db.configuration.findFirst(
          {
            where: {
              id: applicationEndDateConfigKey,
            },
          }
        );

        const timestamp: number | null = JSON.parse(
          beginDate?.value ?? 'null'
        );
        if (timestamp) {
          return new Date(timestamp).toISOString();
        } else {
          return null;
        }
      },
    });
  },
});
