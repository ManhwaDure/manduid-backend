import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { spawn } from 'child_process';
import request, { GraphQLClient } from 'graphql-request';
import graphqlServer from '../src/graphql/server';
import httpServer from '../src/http';
import { loginMutation } from './gqls';

export interface CredentialTestData {
  id: string;
  password: string;
}
type memberTypeEnum =
  | 'AssociateMember'
  | 'RegularMember'
  | 'HonoraryMember'
  | 'Explusion'
  | 'Removed';
export const memberTypes = [
  'AssociateMember',
  'RegularMember',
  'HonoraryMember',
  'Explusion',
  'Removed',
];
export interface MemberTestData {
  memberType: memberTypeEnum;
  department: string;
  name: string;
  phoneNumber: string;
  schoolRegisterationStatus:
    | 'Enrolled'
    | 'Expelled'
    | 'Graduated'
    | 'LeaveOfAbsence'
    | 'MilitaryLeaveOfAbsence';
  birthday: Date;
  studentId: number;
  creationReason: string;
  isPresident: boolean;
}
export const testPresidentCredential: CredentialTestData = {
  id: 'president',
  password: 'president123',
};
export const testPresidentMemberData: MemberTestData = {
  memberType: 'RegularMember',
  department: '만화창작학과',
  name: '김회장',
  phoneNumber: '010-1234-1234',
  schoolRegisterationStatus: 'Enrolled',
  birthday: new Date(1987, 1, 2),
  studentId: 19871234,
  creationReason: '테스트 (회장 테스트 생성)',
  isPresident: true,
};
export const testCredentials: {
  [key in memberTypeEnum]: CredentialTestData;
} = {
  AssociateMember: {
    id: 'kim',
    password: 'kimsclub',
  },
  RegularMember: {
    id: 'puang',
    password: 'caudragon',
  },
  HonoraryMember: {
    id: 'bluemir',
    password: 'on_facebook',
  },
  Removed: {
    id: 'quitted',
    password: 'so_sad',
  },
  Explusion: {
    id: 'banned',
    password: 'ban_hammer',
  },
};
export const testMemberDatas: {
  [key in memberTypeEnum]: MemberTestData;
} = {
  AssociateMember: {
    memberType: 'AssociateMember',
    department: '만화인쇄학과',
    name: '김준준',
    phoneNumber: '010-2222-1234',
    schoolRegisterationStatus: 'Enrolled',
    birthday: new Date(2005, 1, 2),
    studentId: 20055994,
    creationReason: '테스트',
    isPresident: false,
  },
  RegularMember: {
    memberType: 'RegularMember',
    department: '만화감상학과',
    name: '김정정',
    phoneNumber: '010-1111-1234',
    schoolRegisterationStatus: 'MilitaryLeaveOfAbsence',
    birthday: new Date(2000, 1, 2),
    studentId: 20001239,
    creationReason: '테스트',
    isPresident: false,
  },
  HonoraryMember: {
    memberType: 'HonoraryMember',
    department: '만화학부',
    name: '김명명',
    phoneNumber: '010-1918-1234',
    schoolRegisterationStatus: 'Graduated',
    birthday: new Date(2001, 1, 2),
    studentId: 20011237,
    creationReason: '테스트',
    isPresident: false,
  },
  Removed: {
    memberType: 'Removed',
    department: '만화학부',
    name: '김탈퇴',
    phoneNumber: '010-1918-1234',
    schoolRegisterationStatus: 'Graduated',
    birthday: new Date(2002, 2, 2),
    studentId: 20022234,
    creationReason: '테스트',
    isPresident: false,
  },
  Explusion: {
    memberType: 'Explusion',
    department: '만화학부',
    name: '김제명',
    phoneNumber: '010-1918-1234',
    schoolRegisterationStatus: 'Graduated',
    birthday: new Date(2003, 2, 2),
    studentId: 20031244,
    creationReason: '테스트',
    isPresident: false,
  },
};
export const createDummy: () => Promise<{
  presidentMemberId: number;
  graphQlServerPort: number;
  httpServerPort: number;
  stop: () => Promise<void>;
  createPresidentalClient: () => Promise<GraphQLClient>;
}> = () => {
  return new Promise((resolve, reject) => {
    let presidentMemberId;
    const prisma = new PrismaClient();
    // Simply drop and recreate database
    prisma
      .$executeRaw(`DROP DATABASE manduid_test`)
      .then(() =>
        prisma.$executeRaw(`CREATE DATABASE manduid_test`)
      )
      .then(() => {
        // Apply all migrations
        const migrateProcess = spawn(
          'npx',
          [
            'prisma',
            'migrate',
            'deploy',
            '--preview-feature',
          ],
          { shell: true }
        );
        //migrateProcess.stdout.on('data', data => console.log(data.toString().trim().replace(/^(.*?)$/gim, 'migrateProcess : $1')));
        migrateProcess.on('close', async (errorcode) => {
          try {
            if (errorcode != 0) {
              reject(
                new Error(
                  'Error while applying prisma migrations!'
                )
              );
            }

            // create president
            const president = await prisma.member.create({
              data: testPresidentMemberData,
            });
            presidentMemberId = president.id;

            // create sso user
            await prisma.sSOUser.create({
              data: {
                hashAlgorithm: 'bcrypt',
                id: 'president',
                emailAddress: 'example@example.com',
                member: {
                  connect: {
                    id: presidentMemberId,
                  },
                },
                password: await bcrypt.hash(
                  testPresidentCredential.password,
                  await bcrypt.genSalt()
                ),
              },
            });

            for (const i of memberTypes) {
              const member = await prisma.member.create({
                data: testMemberDatas[i],
              });

              await prisma.sSOUser.create({
                data: {
                  hashAlgorithm: 'bcrypt',
                  id: testCredentials[i].id,
                  emailAddress: `test${i}@example.com`,
                  member: {
                    connect: {
                      id: member.id,
                    },
                  },
                  password: await bcrypt.hash(
                    testCredentials[i].password,
                    await bcrypt.genSalt()
                  ),
                },
              });
            }

            // Run server
            const [graphQlServerPort, httpServerPort] = [
              parseInt(process.env.GRAPHQL_PORT),
              parseInt(process.env.HTTP_PORT),
            ];
            const unwrappedGraphQLServer = await graphqlServer.start(
              { port: graphQlServerPort, endpoint: '/' }
            );
            const unwrappedHttpServer = await httpServer.listen(
              httpServerPort
            );
            resolve({
              presidentMemberId,
              graphQlServerPort,
              httpServerPort,
              createPresidentalClient: async () => {
                const serverUrl =
                  'http://127.0.0.1:' + graphQlServerPort;
                const { login } = await request(
                  serverUrl,
                  loginMutation,
                  testPresidentCredential
                );

                if (!login.success)
                  throw new Error(
                    'Error while logging in as president!'
                  );
                const presidentClient = new GraphQLClient(
                  serverUrl
                );
                presidentClient.setHeader(
                  'authorization',
                  'GqlAuth ' + login.token
                );
                return presidentClient;
              },
              stop: () => {
                return new Promise((resolve, reject) => {
                  unwrappedGraphQLServer.close((err) => {
                    if (err) reject(err);
                    unwrappedHttpServer.close((err) => {
                      if (err) reject(err);
                      else resolve();
                    });
                  });
                });
              },
            });
          } catch (err) {
            reject(err);
          }
        });
      })
      .catch(reject);
  });
};
