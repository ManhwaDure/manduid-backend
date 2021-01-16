import {
  Member,
  PrismaClient,
  SSOUser,
} from '@prisma/client';
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
  const claims = {
    sub: user.id,
    name: user.member.name,
    nickname,
    website,
    email,
    email_verifited: true,
    picture: getAvatarUrl(user.id, db),
    birthdate: dateToDateString(user.member.birthday),
    zoneinfo: 'Asia/Seoul',
    locale: 'ko_KR',
    phone_number: user.member.phoneNumber,
  };

  const result: any = {};
  for (const claim of Object.keys(claims).filter((i) =>
    neededClaims.includes(i)
  ))
    result[claim] = (claims as any)[claim];

  return result;
}
