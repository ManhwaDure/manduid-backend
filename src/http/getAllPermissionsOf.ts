import { Member, SSOUser } from '@prisma/client';
import { db } from '../db';
import { permissionDescriptions } from '../graphql/schema/types';

export default async function getAllPermissionsOf(
  user: SSOUser & { member: Member },
  options: {
    populateRoot: boolean;
    populateSubPermissions: boolean;
  } = {
    populateRoot: true,
    populateSubPermissions: true,
  }
): Promise<string[]> {
  if (
    !(user.member.isPresident || user.member.isExecutive)
  ) {
    return [];
  }
  const allPermissions = Object.keys(
    permissionDescriptions
  );
  const grantedPermissions = user.member.isPresident
    ? ['root']
    : (
        await db.permission.findMany({
          where: {
            executiveTypeName:
              user.member.executiveTypeName,
          },
        })
      ).map((i) => i.permission);

  if (
    grantedPermissions.includes('root') &&
    options.populateRoot
  ) {
    return allPermissions;
  } else {
    if (options.populateSubPermissions) {
      return allPermissions
        .filter(
          (i) =>
            grantedPermissions.includes(i) ||
            grantedPermissions.some((j) =>
              i.startsWith(j + '.')
            )
        )
        .reduce((prev, cur) => {
          if (!prev.includes(cur)) prev.push(cur);
          return prev;
        }, []);
    } else return grantedPermissions;
  }
}
