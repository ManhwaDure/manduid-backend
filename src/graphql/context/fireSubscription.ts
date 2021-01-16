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
        subscriptor: {
          include: {
            ssoUser: true,
          },
        },
      },
    });
    for (const subscriptor of subscriptors) {
      await sendEmail(
        subscriptor.subscriptor.ssoUser.emailAddress,
        subscriptor.subscriptor.name,
        'NewApplicationForm',
        data
      );
    }
  }
};
