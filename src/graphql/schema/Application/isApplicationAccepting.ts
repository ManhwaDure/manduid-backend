import { PrismaClient } from '@prisma/client';

export const applicationBeginDateConfigKey =
  'applicationBeginDate';
export const applicationEndDateConfigKey =
  'applicationEndDate';
export const lockApplicationConfigKey = 'lockApplication';

export enum ApplicationNonAcceptingPeroidReason {
  locked,
  earlierThanBeginDate,
  laterThanEndDate,
}

export async function isApplicationAcceptingPeroid(
  db: PrismaClient,
  date?: Date
): Promise<ApplicationNonAcceptingPeroidReason | true> {
  // Use now as default parameter value when date parameter not given
  if (date === null) date = new Date();

  // Check application date
  const locked = await db.configuration.findFirst({
    where: {
      id: lockApplicationConfigKey,
    },
  });

  if (
    locked !== null &&
    JSON.parse(locked.value) === true
  ) {
    return ApplicationNonAcceptingPeroidReason.locked;
  }

  // Return false when submitted earlier than begin date
  const beginDate = await db.configuration.findFirst({
    where: { id: applicationBeginDateConfigKey },
  });
  if (
    beginDate !== null &&
    date < new Date(JSON.parse(beginDate.value))
  ) {
    return ApplicationNonAcceptingPeroidReason.earlierThanBeginDate;
  }

  // Return false when submitted later than end date
  const endDate = await db.configuration.findFirst({
    where: { id: applicationEndDateConfigKey },
  });
  if (
    endDate !== null &&
    date > new Date(JSON.parse(endDate.value))
  ) {
    return ApplicationNonAcceptingPeroidReason.laterThanEndDate;
  }

  return true;
}
