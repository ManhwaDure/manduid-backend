import {
  extendType,
  intArg,
  nonNull,
  stringArg,
} from 'nexus';
import { GraphQLExposableError } from '../../../exposableError';

export const appointExecutiveMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('appointExecutive', {
      type: 'Member',
      description: '특정 회원을 집행부원으로 선임합니다.',
      args: {
        memberId: nonNull(
          intArg({
            description:
              '집행부원으로 선임할 회원의 회원 ID',
          })
        ),
        executiveTypeName: nonNull(
          stringArg({ description: '집행부원 직책 이름' })
        ),
      },
      async resolve(
        _,
        { memberId, executiveTypeName },
        ctx
      ) {
        if (
          (await ctx.db.member.count({
            where: { id: memberId },
          })) === 0
        )
          throw new GraphQLExposableError(
            '존재하지 않는 회원입니다.'
          );

        await ctx.db.member.update({
          where: {
            id: memberId,
          },
          data: {
            isExecutive: true,
            executiveType: {
              connect: {
                name: executiveTypeName,
              },
            },
          },
        });

        return await ctx.db.member.findUnique({
          where: {
            id: memberId,
          },
        });
      },
    });
  },
});
