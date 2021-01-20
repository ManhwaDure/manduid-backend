import bcrypt from 'bcrypt';
import { extendType, stringArg } from 'nexus';
import { GraphQLExposableError } from '../../../../exposableError';

export const signUp_verifyEmailMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.string('signUp_verifyEmail', {
      description:
        '이메일 인증 토큰으로 회원가입 이메일 인증을 함으로써 회원가입을 완료합니다.\n성공시 생성된 아이디를 반환하고 그 외의 경우에는 오류를 발생시킵니다.',
      args: {
        verificationToken: stringArg({
          description: '회원가입 이메일 인증 토큰',
        }),
      },
      async resolve(_, { verificationToken }, ctx) {
        const token = await ctx.db.code.findUnique({
          where: {
            code: verificationToken,
          },
        });

        if (
          token === null ||
          token.usage !== 'EmailVerification'
        )
          throw new GraphQLExposableError(
            '잘못된 토큰입니다.'
          );
        else if (token.expiresAt < new Date())
          throw new GraphQLExposableError(
            '만료된 토큰입니다.'
          );

        const {
          memberId,
          password,
          id,
          emailAddress,
        } = token.data as {
          memberId: number;
          password: string;
          id: string;
          emailAddress: string;
        };

        if (
          (await ctx.db.sSOUser.count({
            where: {
              id,
            },
          })) > 0
        )
          throw new GraphQLExposableError(
            '이메일 인증하는 사이 누군가가 아이디를 가로챘습니다. 다시 시도하세요.'
          );

        const user = await ctx.db.sSOUser.create({
          data: {
            id,
            password: await bcrypt.hash(
              password,
              await bcrypt.genSalt(10)
            ),
            emailAddress,
            hashAlgorithm: 'bcrypt',
            member: {
              connect: {
                id: memberId,
              },
            },
            customAvatarTag: null,
            introduction: '',
            nickname: `만두${(Math.random() * 1000)
              .toString()
              .padStart(4, '0')}`,
            website: '',
          },
        });

        return user.id;
      },
    });
  },
});
