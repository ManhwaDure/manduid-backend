import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
(async () => {
  const president = await prisma.member.create({
    data: {
      department: '소프트웨어학부',
      memberType: 'RegularMember',
      name: '홍길동',
      phoneNumber: '010-1234-1234',
      schoolRegisterationStatus: 'Enrolled',
      studentId: 20201234,
      isPresident: true,
      isExecutive: false,
      ssoUser: {
        create: {
          emailAddress: 'example@cau.ac.kr',
          hashAlgorithm: 'bcrypt',
          id: 'admin',
          password: await bcrypt.hash(
            'admin',
            await bcrypt.genSalt()
          ),
          customAvatarTag: null,
          introduction: '',
          nickname: '',
          website: '',
        },
      },
      createdAt: new Date(),
      creationReason: 'CLI 생성',
      birthday: new Date(2001, 1, 2),
    },
  });
  console.log(
    `created, member id = ${president.id} , sso id = admin, password = id`
  );
  process.exit(0);
})().catch((err) => {
  console.error(err);
});
