import { arg, extendType, nonNull } from 'nexus';
import { GraphQLExposableError } from '../../../exposableError';

export const createMemberMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createMember', {
      type: 'Member',
      description: '회원명부에 회원을 추가합니다.',
      args: {
        data: nonNull(
          arg({
            type: 'MemberRecordInput',
            description: '추가할 회원의 기본사항',
          })
        ),
      },
      async resolve(parent, { data }, ctx) {
        if (
          data.studentId !== null &&
          (await ctx.db.member.findFirst({
            where: {
              studentId: data.studentId,
            },
          })) !== null
        ) {
          throw new GraphQLExposableError(
            '동일한 학번의 회원이 이미 존재합니다.'
          );
        } else if (
          data.phoneNumber !== null &&
          (await ctx.db.member.findFirst({
            where: {
              phoneNumber: data.phoneNumber,
            },
          })) !== null
        ) {
          throw new GraphQLExposableError(
            '동일한 전화번호의 회원이 존재하는 회원입니다.'
          );
        }

        const {
          memberType,
          schoolRegisterationStatus,
          name,
          department,
          studentId,
          phoneNumber,
          birthday,
        } = data;
        return await ctx.db.member.create({
          data: {
            department,
            memberType,
            name,
            phoneNumber,
            schoolRegisterationStatus,
            studentId,
            birthday,
            createdAt: new Date(),
            creationReason: '직접입력',
            createdBy: {
              connect: {
                id: ctx.user.memberId,
              },
            },
            isExecutive: false,
            isPresident: false,
          },
        });
      },
    });
  },
});
