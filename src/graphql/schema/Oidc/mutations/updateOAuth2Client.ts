import {
  booleanArg,
  extendType,
  idArg,
  list,
  nonNull,
  stringArg,
} from 'nexus';
import { transformOAuth2Client } from '../transformOAuth2Client';

export const updateOAuth2Client = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateOAuth2Client', {
      type: 'OAuth2Client',
      description:
        'OAuth2 Client의 정보를 수정합니다. null인 매개변수들은 수정되지 않습니다.',
      args: {
        id: nonNull(
          idArg({
            description:
              '수정하고자 하는 OAuth2 Client의 고유 ID',
          })
        ),
        name: stringArg({ description: '이름' }),
        redirectUris: list(
          nonNull(
            stringArg({
              description: '허용할 리다이렉트 URL',
            })
          )
        ),
        allowedScopes: list(
          nonNull(
            stringArg({ description: '허용할 scope들' })
          )
        ),
        postLogoutRedirectUris: list(
          nonNull(
            stringArg({
              description:
                'RP-Initated Logout 이후 리다이렉트할 uri들',
            })
          )
        ),
        defaultAddedScopes: list(
          nonNull(
            stringArg({
              description:
                '요청하지 않아도 자동으로 추가되는 scope들',
            })
          )
        ),
        backchannelLogoutUri: stringArg({
          description:
            'Backchannel logout 요청을 받을 주소, null일시 미지원으로 간주',
        }),
        returnPermissionsAsObject: booleanArg({
          description:
            'permissions claim을 배열이 아닌 객체 형태로 반환할지의 여부',
        }),
      },
      async resolve(
        _parent,
        {
          id,
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
        const data: {
          name?: string;
          redirectUris?: string;
          allowedScopes?: string;
          postLogoutRedirectUris?: string;
          backchannelLogoutUri?: string;
          defaultAddedScopes?: string;
          returnPermissionsAsObject?: boolean;
        } = {};

        if (name !== null) data.name = name;
        if (redirectUris !== null)
          data.redirectUris = redirectUris.join('\n');
        if (allowedScopes !== null)
          data.allowedScopes = allowedScopes.join(' ');
        if (postLogoutRedirectUris !== null)
          data.postLogoutRedirectUris = postLogoutRedirectUris
            .filter((i) => i.trim().length !== 0)
            .join('\n');
        if (backchannelLogoutUri !== null)
          data.backchannelLogoutUri = backchannelLogoutUri;
        if (defaultAddedScopes !== null)
          data.defaultAddedScopes = defaultAddedScopes.join(
            ' '
          );
        if (returnPermissionsAsObject !== null)
          data.returnPermissionsAsObject = returnPermissionsAsObject;
        const client = await ctx.db.oauth2Client.update({
          where: {
            id,
          },
          data,
        });

        return transformOAuth2Client(client);
      },
    });
  },
});
