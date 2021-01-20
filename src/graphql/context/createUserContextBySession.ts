import {
  GraphQlSession,
  Member,
  PrismaClient,
  SSOUser,
} from '@prisma/client';
import { Permission } from './permissions';
import { UserContext } from './types';

const db = new PrismaClient();
export default function (
  session: GraphQlSession & {
    ssoUser: SSOUser & { member: Member };
  }
): UserContext {
  const { member } = session.ssoUser;
  return {
    authenticated: true,
    loggedInAt: session.createdAt,
    memberId: member.id,
    ssoUserId: session.ssoUser.id,
    isPresident: member.isPresident,
    sessionId: session.id,
    hasPermission: async (permission: Permission) => {
      if (member.isPresident) return true;
      else if (member.isExecutive) {
        const permsToFind = permission.split('.');
        permsToFind.push('root');
        for (let i = 1; i < permsToFind.length; i++) {
          permsToFind[i] =
            permsToFind[i - 1] + '.' + permsToFind[i];
        }
        return (
          (await db.permission.count({
            where: {
              executiveTypeName: member.executiveTypeName,
              permission: {
                in: permsToFind,
              },
            },
          })) != 0
        );
      } else {
        return false;
      }
    },
  };
}
