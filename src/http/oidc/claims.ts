import {
  Member,
  PrismaClient,
  SSOUser,
} from '@prisma/client';
import getAvatarUrl from '../../graphql/schema/Member/getAvatarUrl';
import getAllPermissionsOf from '../getAllPermissionsOf';

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
  neededClaims: string[],
  options: { permissionsAsObject: boolean } = {
    permissionsAsObject: false,
  }
): Promise<any> {
  const { nickname, website, emailAddress: email } = user;
  let permissions: string[] | { [key: string]: true } = [];
  if (user.member.isExecutive || user.member.isPresident) {
    permissions = await getAllPermissionsOf(user);
  }

  if (options.permissionsAsObject) {
    const newPermissions: { [key: string]: true } = {};
    for (const i of permissions) newPermissions[i] = true;

    permissions = newPermissions;
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
