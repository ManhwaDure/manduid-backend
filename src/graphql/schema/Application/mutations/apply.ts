import { arg, extendType, list, nonNull } from 'nexus';
import { GraphQLExposableError } from '../../../exposableError';
import {
  ApplicationNonAcceptingPeroidReason,
  isApplicationAcceptingPeroid,
} from '../isApplicationAccepting';

export const ApplyMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('apply', {
      args: {
        form: nonNull(
          arg({
            type: 'ApplicationFormInput',
            description: '제출하고자 하는 입부원서',
          })
        ),
        additionalAnswers: list(
          nonNull(
            arg({
              type: 'ApplicationFormAdditionalAnswerInput',
              description:
                '입부원서와 함께 제출할 추가질문 답변들',
            })
          )
        ),
      },
      type: 'ApplicationForm',
      description:
        '입부원서를 제출합니다. 성공시 입부원서 번호를 반환합니다.',
      async resolve(
        _parent,
        { form, additionalAnswers },
        ctx
      ) {
        const isApplicationAcceptingPeroidNow = await isApplicationAcceptingPeroid(
          ctx.db
        );
        if (isApplicationAcceptingPeroidNow !== true) {
          switch (isApplicationAcceptingPeroidNow) {
            case ApplicationNonAcceptingPeroidReason.locked:
              throw new GraphQLExposableError(
                '현재 입부원서를 받지 않고 있습니다.'
              );

            case ApplicationNonAcceptingPeroidReason.earlierThanBeginDate:
              throw new GraphQLExposableError(
                '아직 입부원서 제출 시작일이 아닙니다.'
              );

            case ApplicationNonAcceptingPeroidReason.laterThanEndDate:
              throw new GraphQLExposableError(
                '입부원서 제출이 마감되어 더 이상의 입부원서를 받지 않습니다.'
              );
          }
        }

        const additionalAnswersProvied =
          typeof additionalAnswers !== 'undefined' &&
          additionalAnswers !== null &&
          additionalAnswers.length !== 0;
        const requiredQuestions = await ctx.db.applicationFormAdditionalQuestion.findMany(
          {
            where: {
              deleted: false,
              required: true,
            },
            select: {
              id: true,
            },
          }
        );

        if (
          additionalAnswersProvied &&
          (await ctx.db.applicationFormAdditionalQuestion.count(
            {
              where: {
                deleted: true,
                id: {
                  in: additionalAnswers.map(
                    (i) => i.questionId
                  ),
                },
              },
            }
          )) > 0
        )
          throw new GraphQLExposableError(
            '삭제된 질문에 답할 수 없습니다.'
          );

        if (
          additionalAnswersProvied &&
          requiredQuestions.reduce((acc, cur) => {
            if (
              !additionalAnswers.some(
                (i) =>
                  i.questionId === cur.id &&
                  i.answer.length !== 0
              )
            )
              acc.push(cur.id);
            return acc;
          }, []).length !== 0
        )
          throw new GraphQLExposableError(
            '모든 필수 질문에 답하셔야 합니다.'
          );

        if (form.birthday < new Date(1987, 1, 1))
          throw new GraphQLExposableError(
            '생일을 잘못 입력하셨습니다.'
          );
        if (form.department.trim().length === 0)
          throw new GraphQLExposableError(
            '학과를 입력해주세요.'
          );
        if (form.name.trim().length === 0)
          throw new GraphQLExposableError(
            '이름을 제대로 입력해주세요.'
          );
        if (form.phoneNumber.trim().length === 0)
          throw new GraphQLExposableError(
            '핸드폰 번호를 제대로 입력해주세요.'
          );
        if (form.studentId <= 10000000)
          throw new GraphQLExposableError(
            '학번을 올바르게 입력해주세요.'
          );

        const member = await ctx.db.member.findFirst({
          where: {
            studentId: form.studentId,
          },
        });
        if (
          member !== null &&
          member.memberType !== 'Removed' &&
          member.memberType !== 'Explusion'
        ) {
          throw new GraphQLExposableError(
            '이미 존재하는 회원입니다.'
          );
        } else if (
          member !== null &&
          member.memberType === 'Explusion'
        ) {
          throw new GraphQLExposableError(
            '제명된 회원은 다시 입부하실 수 없습니다'
          );
        }

        const reApplication =
          member !== null &&
          member.memberType === 'Removed';

        const formCreated = await ctx.db.applicationForm.create(
          {
            data: {
              birthday: form.birthday,
              department: form.department,
              name: form.name,
              phoneNumber: form.phoneNumber,
              studentId: form.studentId,
              reApplication,
              additionalAnswers: additionalAnswersProvied
                ? {
                    create: additionalAnswers.map((i) => {
                      return {
                        answer: i.answer,
                        question: {
                          connect: {
                            id: i.questionId,
                          },
                        },
                      };
                    }),
                  }
                : undefined,
            },
            include: {
              additionalAnswers: {
                include: {
                  question: true,
                },
              },
            },
          }
        );

        // Do not wait
        ctx.fireSubscription('NewApplicationForm', {
          form: formCreated,
          additionalAnswers: formCreated.additionalAnswers.map(
            (i) => {
              return {
                answer: i.answer,
                question: i.question.question,
              };
            }
          ),
          applicationId: formCreated.applicationId,
          reApplication: formCreated.reApplication,
        });

        return formCreated;
      },
    });
  },
});
