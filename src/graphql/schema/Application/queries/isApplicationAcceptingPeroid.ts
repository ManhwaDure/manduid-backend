import { extendType } from 'nexus';
import { isApplicationAcceptingPeroid } from '../isApplicationAccepting';

export const applicationsAccepting = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.boolean('applicationsAccepting', {
      description:
        '현재 입부원서를 받고 있는 기간인지의 여부입니다.',
      async resolve(parent, args, ctx) {
        return (
          (await isApplicationAcceptingPeroid(ctx.db)) ===
          true
        );
      },
    });
  },
});
