import { PrismaClient } from '@prisma/client';
import md5 from 'md5';

export default async (
  ssoUserId: string,
  db: PrismaClient
) => {
  const user = await db.sSOUser.findUnique({
    where: {
      id: ssoUserId,
    },
    select: {
      emailAddress: true,
    },
  });

  return `https://www.gravatar.com/avatar/${md5(
    user.emailAddress.trim().toLowerCase()
  )}?d=identicon`;
};
