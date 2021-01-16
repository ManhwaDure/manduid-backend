import { ContextParameters } from 'graphql-yoga/dist/types';
import { db } from '../../db';
import createUserContextBySession from './createUserContextBySession';
import { fireSubscription } from './fireSubscription';
import { Permission } from './permissions';
import { sendEmail } from './sendEmail';
import { Context, UserContext } from './types';

export default async (
  ctx: ContextParameters
): Promise<Context> => {
  let user: UserContext = null;
  try {
    if (
      ctx.request.headers.authorization &&
      ctx.request.headers.authorization.startsWith(
        'GqlAuth '
      )
    ) {
      const token = ctx.request.headers.authorization.substring(
        8
      );

      const session = await db.graphQlSession.findFirst({
        where: {
          id: token,
          expiresAt: {
            gte: new Date(),
          },
        },
        include: {
          ssoUser: {
            include: {
              member: true,
            },
          },
        },
      });

      if (session !== null) {
        const { member } = session.ssoUser;
        if (
          member.memberType === 'Explusion' ||
          member.memberType === 'Removed'
        ) {
          user = null;
        } else {
          user = createUserContextBySession(session);
          await db.graphQlSession.update({
            where: {
              id: token,
            },
            data: {
              expiresAt: new Date(
                Date.now() + 1000 * 60 * 60
              ),
            },
          });
        }
      }
    }
  } finally {
    if (user == null)
      user = {
        authenticated: false,
        hasPermission: async (_permission: Permission) =>
          false,
      };
  }
  return {
    db,
    user,
    sendEmail,
    fireSubscription,
  };
};
