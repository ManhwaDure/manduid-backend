import {
  arg,
  extendType,
  intArg,
  nonNull,
  stringArg,
} from 'nexus';
import { GraphQLExposableError } from '../../../exposableError';

export const updateMemberMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateMember', {
      type: 'Member',
      description: '회원의 기본사항을 수정합니다.',
      args: {
        memberId: nonNull(
          intArg({
            description: '수정하고자 하는 회원의 회원ID',
          })
        ),
        data: nonNull(
          arg({
            type: 'MemberRecordInput',
            description: '회원의 새로운 기본사항',
          })
        ),
        reason: stringArg({
          description: '수정사유',
        }),
      },
      async resolve(src, { memberId, data, reason }, ctx) {
        const member = await ctx.db.member.findUnique({
          where: {
            id: memberId,
          },
        });

        if (member === null)
          throw new GraphQLExposableError(
            '존재하지 않는 회원입니다.'
          );

        await ctx.db.memberRecordHistory.create({
          data: {
            createdBy: {
              connect: {
                id: ctx.user.memberId,
              },
            },
            createdAt: member.createdAt,
            creationReason: member.creationReason,
            department: member.department,
            name: member.name,
            member: {
              connect: {
                id: member.id,
              },
            },
            memberType: member.memberType,
            phoneNumber: member.phoneNumber,
            schoolRegisterationStatus:
              member.schoolRegisterationStatus,
            studentId: member.studentId,
            birthday: member.birthday,
            isExecutive: member.isExecutive,
            isPresident: member.isPresident,
            executiveType: member.isExecutive
              ? {
                  connect: {
                    name: member.executiveTypeName,
                  },
                }
              : undefined,
          },
        });

        await ctx.db.member.update({
          where: {
            id: memberId,
          },
          data,
        });
        await ctx.db.member.update({
          where: {
            id: memberId,
          },
          data: {
            createdAt: new Date(),
            createdBy: {
              connect: {
                id: ctx.user.memberId,
              },
            },
            creationReason: reason || '',
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
