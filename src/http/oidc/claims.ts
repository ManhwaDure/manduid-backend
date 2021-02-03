import {
  Member,
  PrismaClient,
  SSOUser,
} from '@prisma/client';
import { permissionDescriptions } from '../../graphql/schema/Executive/queries/permissionDescriptions';
import getAvatarUrl from '../../graphql/schema/Member/getAvatarUrl';

const db = new PrismaClient();

const dateToDateString = (date: Date) => {
  return `${date
    .getFullYear()
    .toString()
    .padStart(4, '0')}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;
};

export default async function (
  user: SSOUser & { member: Member },
  neededClaims: string[]
) {
  const { nickname, website, emailAddress: email } = user;
  let permissions: string[] = [];
  if (user.member.isExecutive || user.member.isPresident) {
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
    if (grantedPermissions.includes('root')) {
      permissions = allPermissions;
    } else {
      permissions = allPermissions.filter(
        (i) =>
          grantedPermissions.includes(i) ||
          grantedPermissions.some((j) =>
            i.startsWith(j + '.')
          )
      );
      permissions = permissions.reduce((prev, cur) => {
        if (!prev.includes(cur)) prev.push(cur);
        return prev;
      }, []);
    }
  }
  const claims = {
    sub: user.id,
    name: user.member.name,
    nickname,
    website,
    email,
    email_verified: true,
    picture: await getAvatarUrl(user.id, db),
    birthdate: dateToDateString(user.member.birthday),
    zoneinfo: 'Asia/Seoul',
    locale: 'ko_KR',
    phone_number: user.member.phoneNumber,
    permissions,
    president: user.member.isPresident,
  };

  const result: any = {};
  for (const claim of Object.keys(claims).filter((i) =>
    neededClaims.includes(i)
  ))
    result[claim] = (claims as any)[claim];

  return result;
}
