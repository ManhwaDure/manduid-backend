import axios from 'axios';
import { extendType, nonNull, stringArg } from 'nexus';
import querystring from 'querystring';
import randomString from 'random-string';
import { createIdToken } from '../../../../jwt';
import { GraphQLExposableError } from '../../../exposableError';

export const LogoutMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.boolean('logout', {
      description:
        'GraphQL API에서 로그아웃하며, 다른 웹사이트들도 함께 로그아웃합니다. 성공시 true를, 세션을 찾을 수 없을 시 false를, 그 외의 경우에는 오류를 반환합니다.',
      args: {
        token: nonNull(
          stringArg({
            description:
              '로그아웃을 진행할 로그인 토큰입니다.',
          })
        ),
      },
      async resolve(_parent, { token }, ctx) {
        const session = await ctx.db.graphQlSession.findUnique(
          {
            where: {
              id: token,
            },
            include: {
              OidcSessions: {
                include: {
                  client: true,
                },
              },
              ssoUser: true,
            },
          }
        );
        if (session === null) return false;

        const backchannelRequests = [];
        for (const oidcSession of session.OidcSessions) {
          const {
            backchannelLogoutUri,
          } = oidcSession.client;
          if (
            backchannelLogoutUri !== null &&
            backchannelLogoutUri.trim() !== ''
          ) {
            // Create Logout Token
            const logoutToken = await createIdToken(
              session.ssoUser,
              {
                isLogoutToken: true,
                audienceId: oidcSession.clientId,
                authTime: false,
                jti:
                  Date.now().toString() +
                  '-' +
                  randomString({ length: 40 }),
                sessionId: oidcSession.id,
              }
            );

            backchannelRequests.push(
              axios.post(
                backchannelLogoutUri,
                querystring.stringify({
                  logout_token: logoutToken,
                }),
                {
                  headers: {
                    'Content-Type':
                      'application/x-www-form-urlencoded',
                  },
                }
              )
            );
          }
        }

        const backchannelResponses = await Promise.all(
          backchannelRequests
        );
        for (const backchannelResponse of backchannelResponses) {
          switch (backchannelResponse.status) {
            case 200:
              continue;
            case 400:
              throw new GraphQLExposableError(
                'SLO(Backchannel Logout) 진행중 잘못된 요청으로 인해 오류가 발생했습니다. 회장단에게 문의해주세요.'
              );
            case 501:
              throw new GraphQLExposableError(
                'SLO(Backchannel Logout) 진행중 실패한 요청이 있습니다. 회장단에게 문의해주세요.'
              );
            case 504:
              throw new GraphQLExposableError(
                'SLO(Backchannel Logout) 진행중 다운스트림 로그아웃에 실패한 요청이 있습니다. 회장단에게 문의해주세요.'
              );
            default:
              throw new GraphQLExposableError(
                `SLO(Backchannel Logout) 응답을 받았으나 응답 코드가 예상하지 못한 코드(${backchannelResponse.status})입니다. 회장단에게 문의해주세요.`
              );
          }
        }

        await ctx.db.oidcSession.deleteMany({
          where: {
            id: {
              in: session.OidcSessions.map((i) => i.id),
            },
          },
        });
        await ctx.db.graphQlSession.delete({
          where: {
            id: ctx.user.sessionId,
          },
        });
        return true;
      },
    });
  },
});
