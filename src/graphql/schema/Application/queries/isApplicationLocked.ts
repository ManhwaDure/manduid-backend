import { extendType } from 'nexus';
import {
  ApplicationNonAcceptingPeroidReason,
  isApplicationAcceptingPeroid,
} from '../isApplicationAccepting';

export const isApplicationsLocked = extendType({
  type: 'Query',
  definition(t) {
    t.boolean('isApplicationsLocked', {
      description:
        '현재 입부원서/재입부원서 제출이 잠겨있는 지의 여부입니다.',
      async resolve(parent, args, ctx) {
        return (
          (await isApplicationAcceptingPeroid(ctx.db)) ===
          ApplicationNonAcceptingPeroidReason.locked
        );
      },
    });
  },
});
