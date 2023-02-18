import { PrismaClient } from '@prisma/client';
import { sendEmail } from './sendEmail';
import { FireSubscriptionFunction } from './types';

const db = new PrismaClient();
export const fireSubscription: FireSubscriptionFunction = async (
  type,
  data
) => {
  if (type === 'NewApplicationForm') {
    const subscriptors = await db.subscription.findMany({
      where: {
        target: 'NewApplicationForm',
      },
      include: {
        subscriptor: true,
      },
    });

    for (const subscriptor of subscriptors) {
      const ssoUser = await db.sSOUser.findFirst({
        where: {
          memberId: subscriptor.subscriptor.id,
        },
      });

      if (ssoUser === null) {
        continue;
      }

      await sendEmail(
        ssoUser.emailAddress,
        subscriptor.subscriptor.name,
        'NewApplicationForm',
        data
      );
    }
  }
};
