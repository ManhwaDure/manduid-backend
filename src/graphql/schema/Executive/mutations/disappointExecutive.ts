import { extendType, intArg, nonNull } from 'nexus';
import { GraphQLExposableError } from '../../../exposableError';

export const disappointExecutiveMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('disappointExecutive', {
      description: '특정 회원을 집행부원직에서 해임합니다.',
      type: 'Member',
      args: {
        memberId: nonNull(
          intArg({
            description:
              '집행부원 직책에서 해임할 회원의 회원ID',
          })
        ),
      },
      async resolve(_, { memberId }, ctx) {
        const member = await ctx.db.member.findUnique({
          where: { id: memberId },
          select: { isExecutive: true },
        });
        if (member === null)
          throw new GraphQLExposableError(
            '존재하지 않는 회원입니다.'
          );
        else if (!member.isExecutive)
          throw new GraphQLExposableError(
            '집행부원이 아닙니다.'
          );

        await ctx.db.member.update({
          where: {
            id: memberId,
          },
          data: {
            isExecutive: false,
            executiveType: {
              disconnect: true,
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
