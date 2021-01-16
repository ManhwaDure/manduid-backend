import { enumType } from 'nexus';

export const SubscriptionTarget = enumType({
  name: 'SubscriptionTarget',
  description: '구독 대상',
  members: [
    {
      name: 'NewApplicationForm',
      value: 'NewApplicationForm',
      description: '신규 입부/재입부원서',
    },
  ],
});

export const SubscriptionMethod = enumType({
  name: 'SubscriptionMethod',
  description: '구독 방법',
  members: [
    {
      name: 'Email',
      value: 'Email',
      description: '이메일',
    },
  ],
});
