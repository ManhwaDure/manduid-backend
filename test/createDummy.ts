import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { spawn } from "child_process";
import server from '../src/server';

export interface CredentialTestData {
    id: string;
    password: string;
}
export interface MemberTestData {
    memberType: 'AssociateMember' | 'RegularMember' | 'HonoraryMember' | 'Explusion' | 'Removed',
    department: string,
    name: string,
    phoneNumber: string,
    schoolRegisterationStatus: 'Enrolled' | 'Expelled' | 'Graduated' | 'LeaveOfAbsence' | 'MilitaryLeaveOfAbsence' | 'Removed',
    birthday: Date,
    studentId: number,
    creationReason: string,
    isPresident: boolean
}
export const testPresidentCredential: CredentialTestData = {
    id: 'president',
    password: 'president123'
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
    isPresident: true
}
export const testCredentials: CredentialTestData[] = [{
    id: 'kim',
    password: 'kimsclub'
}, {
    id: 'puang',
    password: 'caudragon'
}, {
    id: 'bluemir',
    password: 'on_facebook'
}, {
    id: 'quitted',
    password: 'so_sad' 
}, {
    id: 'banned',
    password: 'ban_hammer'
}];
export const testMemberDatas: MemberTestData[] = [{
    memberType: 'AssociateMember',
    department: '만화인쇄학과',
    name: '김준준',
    phoneNumber: '010-2222-1234',
    schoolRegisterationStatus: 'Enrolled',
    birthday: new Date(2005, 1, 2),
    studentId: 20055994,
    creationReason: '테스트',
    isPresident: false
}, {
    memberType: 'RegularMember',
    department: '만화감상학과',
    name: '김정정',
    phoneNumber: '010-1111-1234',
    schoolRegisterationStatus: 'MilitaryLeaveOfAbsence',
    birthday: new Date(2000, 1, 2),
    studentId: 20001239,
    creationReason: '테스트',
    isPresident: false
}, {
    memberType: 'HonoraryMember',
    department: '만화학부',
    name: '김명명',
    phoneNumber: '010-1918-1234',
    schoolRegisterationStatus: 'Graduated',
    birthday: new Date(2001, 1, 2),
    studentId: 20011237,
    creationReason: '테스트',
    isPresident: false
}, {
    memberType: 'Removed',
    department: '만화학부',
    name: '김탈퇴',
    phoneNumber: '010-1918-1234',
    schoolRegisterationStatus: 'Graduated',
    birthday: new Date(2002, 2, 2),
    studentId: 20022234,
    creationReason: '테스트',
    isPresident: false
}, {
    memberType: 'Explusion',
    department: '만화학부',
    name: '김제명',
    phoneNumber: '010-1918-1234',
    schoolRegisterationStatus: 'Graduated',
    birthday: new Date(2003, 2, 2),
    studentId: 20031244,
    creationReason: '테스트',
    isPresident: false
}]
export const createDummy : () => Promise<{presidentMemberId : number, stop: () => Promise<void>}> = () => {
    return new Promise((resolve, reject) => {
        let presidentMemberId;
        const prisma = new PrismaClient();
        // Simply drop and recreate database
        prisma.$executeRaw(`DROP DATABASE manduid_test`)
        .then(() => prisma.$executeRaw(`CREATE DATABASE manduid_test`))
        .then(() => {
            // Apply all migrations
            const migrateProcess = spawn('npx', ['prisma', 'migrate', 'deploy', '--preview-feature'], {shell: true});
            //migrateProcess.stdout.on('data', data => console.log(data.toString().trim().replace(/^(.*?)$/gim, 'migrateProcess : $1')));
            migrateProcess.on('close', async errorcode => {
                try {
                    if (errorcode != 0) {
                        reject(new Error('Error while applying prisma migrations!'));
                    }
                    
                    // create president
                    const president = await prisma.member.create({
                        data: testPresidentMemberData
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
                                    id: presidentMemberId
                                }
                            },
                            password: await bcrypt.hash(testPresidentCredential.password, await bcrypt.genSalt())
                        }
                    });

                    for (let i = 0; i < testMemberDatas.length; i++) {
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
                                        id: member.id
                                    }
                                },
                                password: await bcrypt.hash(testCredentials[i].password, await bcrypt.genSalt())
                            }
                        });
                    }

                    // Run server
                    const unwrappedServer = await server.start(() => {
                        resolve({presidentMemberId, stop: () => {
                            return new Promise((resolve, reject) => {
                                unwrappedServer.close((err) => {
                                    if (err)
                                        reject(err);
                                    else
                                        resolve();
                                })
                            });
                        }});
                    })
                } catch (err) {
                    reject(err);
                }
            })
        })
        .catch(reject);
    });
}