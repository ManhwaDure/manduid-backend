import {
  booleanArg,
  extendType,
  list,
  nonNull,
  stringArg,
} from 'nexus';
import randomString from 'random-string';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const createOAuth2Client = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createOAuth2Client', {
      type: 'OAuth2Client',
      description: 'OAuth2 Client를 생성합니다.',
      args: {
        name: nonNull(
          stringArg({ description: 'Client 이름' })
        ),
        redirectUris: nonNull(
          list(
            nonNull(
              stringArg({
                description: '허용할 redirect uri들',
              })
            )
          )
        ),
        allowedScopes: nonNull(
          list(
            nonNull(
              stringArg({ description: '허용할 scope들' })
            )
          )
        ),
        postLogoutRedirectUris: nonNull(
          list(
            nonNull(
              stringArg({
                description:
                  'RP-Initated Logout 이후 리다이렉트할 uri들',
              })
            )
          )
        ),
        defaultAddedScopes: nonNull(
          list(
            nonNull(
              stringArg({
                description:
                  '요청하지 않아도 자동으로 추가되는 scope들',
              })
            )
          )
        ),
        returnPermissionsAsObject: nonNull(
          booleanArg({
            description:
              'permissions claim을 배열이 아닌 객체 형태로 반환할지의 여부',
          })
        ),
        backchannelLogoutUri: stringArg({
          description:
            'Backchannel logout 요청을 받을 주소, null일시 미지원으로 간주',
        }),
      },
      async resolve(
        _parent,
        {
          name,
          redirectUris,
          allowedScopes,
          postLogoutRedirectUris,
          backchannelLogoutUri,
          defaultAddedScopes,
          returnPermissionsAsObject,
        },
        ctx
      ) {
        const client = await ctx.db.oauth2Client.create({
          data: {
            secret: randomString({ length: 70 }),
            name,
            redirectUris: redirectUris.join('\n'),
            allowedScopes: allowedScopes.join(' '),
            postLogoutRedirectUris: postLogoutRedirectUris.join(
              '\n'
            ),
            backchannelLogoutUri,
            defaultAddedScopes: defaultAddedScopes.join(
              ' '
            ),
            returnPermissionsAsObject,
          },
        });

        return transformOAuth2Client(client);
      },
    });
  },
});
