import { PrismaClient } from '@prisma/client';
import { Permission } from './permissions';

export type UserContext = {
  authenticated: boolean;
  memberId?: number;
  loggedInAt?: Date;
  ssoUserId?: string;
  isPresident?: boolean;
  sessionId?: string;
  hasPermission: (
    permission: Permission
  ) => Promise<boolean>;
};

export type EmailTokenData = {
  token: string;
};
export interface Context {
  db: PrismaClient;
  user: UserContext;
  sendEmail: SendEmailFunction;
  fireSubscription: FireSubscriptionFunction;
}

export type NewApplicationFormEmailDataType = {
  applicationId: string;
  reApplication: boolean;
  form: {
    name: string;
    studentId: number;
    department: string;
    birthday: Date;
    phoneNumber: string;
  };
  additionalAnswers: {
    question: string;
    answer: string;
  }[];
};

export type FireSubscriptionFunction = (
  type: 'NewApplicationForm',
  data: NewApplicationFormEmailDataType
) => void;

export type SendEmailFunction = ((
  email: string,
  receiverName: string,
  type: 'VerificationEmail' | 'PasswordReset',
  data: EmailTokenData
) => Promise<void>) &
  ((
    email: string,
    receiverName: string,
    type: 'NewApplicationForm',
    data: NewApplicationFormEmailDataType
  ) => Promise<void>);
