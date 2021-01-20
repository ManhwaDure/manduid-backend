import IsEmail from 'isemail';
import { extendType, nonNull, stringArg } from 'nexus';
import { GraphQLExposableError } from '../../../../exposableError';

export const signUp_createIdMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.string('signUp_createId', {
      description:
        '회원여부 확인시 signUp_verifyMembership에서 반환한 토큰과 함께 ID를 생성합니다. 성공시 인증 이메일 재전송 토큰을 반환합니다.',
      args: {
        membershipVerificationToken: nonNull(
          stringArg({
            description:
              'signUp_verifyMembership에서 반환한 회원여부 인증 토큰',
          })
        ),
        id: nonNull(
          stringArg({
            description:
              '생성하고자 하는 아이디, 로그인에 이용되는 아이디임.',
          })
        ),
        emailAddress: nonNull(
          stringArg({
            description: '이메일 주소',
          })
        ),
        password: nonNull(
          stringArg({
            description: '비밀번호',
          })
        ),
      },
      async resolve(
        src,
        {
          membershipVerificationToken,
          emailAddress,
          id,
          password,
        },
        ctx
      ) {
        const token = await ctx.db.code.findUnique({
          where: {
            code: membershipVerificationToken,
          },
        });

        id = id.toLowerCase();
        if (
          token === null ||
          token.usage !== 'MembershipVerification'
        )
          throw new GraphQLExposableError(
            '잘못된 토큰입니다.'
          );
        else if (token.expiresAt < new Date())
          throw new GraphQLExposableError(
            '만료된 토큰입니다.'
          );
        else if (id.trim().length === 0)
          throw new GraphQLExposableError(
            '아이디를 입력해주세요.'
          );
        else if (/[^_a-zA-Z0-9]+/.test(id))
          throw new GraphQLExposableError(
            '아이디는 영문 대소문자, 숫자, 언더스코어(_)만 가능합니다.'
          );
        else if (
          (await ctx.db.sSOUser.findUnique({
            where: {
              id,
            },
          })) !== null
        )
          throw new GraphQLExposableError(
            '이미 존재하는 아이디입니다.'
          );
        else if (password.length < 5)
          throw new GraphQLExposableError(
            '비밀번호는 최소 5글자 이상이어야 합니다.'
          );
        else if (!IsEmail.validate(emailAddress))
          throw new GraphQLExposableError(
            '이메일 주소가 올바르지 않습니다.'
          );
        else if (!emailAddress.endsWith('@cau.ac.kr'))
          throw new GraphQLExposableError(
            '학교 이메일(@cau.ac.kr으로 끝나는 이메일)만 사용하실 수 있습니다.'
          );

        const data: any = token.data;
        data.id = id;
        data.password = password;
        data.emailAddress = emailAddress;

        const VerificationToken = await ctx.db.code.create({
          data: {
            data,
            expiresAt: new Date(
              Date.now() + 1000 * 60 * 30
            ),
            usage: 'EmailVerification',
            id: '',
          },
        });
        const ResendEmailToken = await ctx.db.code.create({
          data: {
            data: {
              token: VerificationToken.code,
            },
            expiresAt: new Date(
              Date.now() + 1000 * 60 * 30
            ),
            usage: 'ResendEmailVerification',
            id: '',
          },
        });

        await ctx.sendEmail(
          emailAddress,
          data.name,
          'VerificationEmail',
          {
            token: VerificationToken.code,
          }
        );

        return ResendEmailToken.code;
      },
    });
  },
});
