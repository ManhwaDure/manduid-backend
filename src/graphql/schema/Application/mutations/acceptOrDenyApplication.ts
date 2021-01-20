import {
  booleanArg,
  extendType,
  nonNull,
  stringArg,
} from 'nexus';
import { GraphQLExposableError } from '../../../exposableError';

export const acceptApplication = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('acceptOrDenyApplication', {
      type: 'ApplicationAcceptance',
      description:
        '입부원서를 승인하거나 거절합니다. 입부원서 승인시 회원명부에 자동으로 추가됩니다.',
      args: {
        applicationId: nonNull(
          stringArg({ description: '승인할 입부원서 ID' })
        ),
        accepts: nonNull(
          booleanArg({
            description:
              '승인여부(거절하고자 할 경우 false로 한다.)',
          })
        ),
        reason: stringArg({
          description: '승인 및 거절의 사유',
        }),
      },
      async resolve(
        parent,
        { applicationId, accepts, reason },
        ctx
      ) {
        const applicationForm = await ctx.db.applicationForm.findUnique(
          {
            where: {
              applicationId,
            },
          }
        );

        if (applicationForm === null)
          throw new GraphQLExposableError(
            '해당 입부원서가 존재하지 않습니다.'
          );

        if (
          (await ctx.db.applicationAcceptance.findUnique({
            where: {
              applicationId,
            },
          })) !== null
        )
          throw new GraphQLExposableError(
            '이미 처리된 입부원서입니다'
          );

        const acceptance = await ctx.db.applicationAcceptance.create(
          {
            data: {
              accepted: accepts,
              acceptedBy: {
                connect: {
                  id: ctx.user.memberId,
                },
              },
              acceptedAt: new Date(),
              reason: reason || '',
              applicationForm: {
                connect: {
                  applicationId,
                },
              },
            },
          }
        );

        if (accepts)
          await ctx.db.member.create({
            data: {
              department: applicationForm.department,
              memberType: 'AssociateMember',
              name: applicationForm.name,
              phoneNumber: applicationForm.phoneNumber,
              schoolRegisterationStatus: 'Enrolled',
              studentId: applicationForm.studentId,
              isPresident: false,
              isExecutive: false,
              birthday: applicationForm.birthday,
              createdAt: new Date(),
              createdBy: {
                connect: {
                  id: ctx.user.memberId,
                },
              },
              creationReason:
                '온라인 입부원서 허가, 사유 : ' + reason,
            },
          });

        return acceptance;
      },
    });
  },
});
