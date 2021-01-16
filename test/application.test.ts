import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import request, { GraphQLClient } from "graphql-request";
import * as dummyServer from './createDummy';
import { acceptOrDenyApplicationMutation, applicationsQuery, applyMutation, loginMutation, membersQuery } from "./gqls";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("Application", () => {
    let presidentMemberId: number, stopServer: () => Promise<void>;
    before("Create dummy data", async function () {
        this.timeout(60000);
        const result = await dummyServer.createDummy();
        presidentMemberId = result.presidentMemberId;
        stopServer = result.stop;
    });

    let presidentClient: GraphQLClient
    before("Authenticate with president credential", async function () {
        const { login } = await request('http://127.0.0.1:4000', loginMutation, dummyServer.testPresidentCredential);
        
        if (!login.success)
            throw new Error('Error while logging in as president!');
        presidentClient = new GraphQLClient('http://127.0.0.1:4000');
        presidentClient.setHeader('authorization', 'Bearer ' + login.token);
    });

    let applicationFormId: string;
    it("Is it able to apply?", async () => {
        const data = await request('http://127.0.0.1:4000', applyMutation, {
            form : {
                name: '김김김',
                department: '만화창작학부',
                studentId: 20190101,
                phoneNumber: '010-1111-2222',
                birthday: '2000-01-01'
            }
        });
        expect(data).to.haveOwnProperty('apply');
        expect(data.apply).to.be.a('string');
        expect(data.apply).not.be.empty;

        applicationFormId = data.apply;
    });

    it("Is it unable to apply with existed-member?", async () => {
        const {name, department, studentId, phoneNumber, birthday} = dummyServer.testMemberDatas[0];
        const dataPromise = request('http://127.0.0.1:4000', applyMutation, {
            form : {
                name,
                department,
                studentId,
                phoneNumber,
                birthday: `${birthday.getFullYear()}-${(birthday.getMonth() + 1).toString().padStart(2, '0')}-${birthday.getDate().toString().padStart(2, '0')}`
            }
        });
        expect(dataPromise).to.eventually.be.rejectedWith('이미 존재하는 회원입니다.');

    });

    it("Is it able to deny application form?", async () => {
        const applicationId = applicationFormId;
        const data = await presidentClient.request(acceptOrDenyApplicationMutation, {
            accepts: false,
            applicationId,
            reason: 'TEST'
        });
        
        expect(data).to.haveOwnProperty('acceptOrDenyApplication');
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('accepterId')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('accepted')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('applicationId')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('acceptedAt')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('reason')
        expect(data.acceptOrDenyApplication.accepterId).to.equals(presidentMemberId);
        expect(data.acceptOrDenyApplication.accepted).to.equals(false);
        expect(data.acceptOrDenyApplication.applicationId).to.equals(applicationId);
        expect(data.acceptOrDenyApplication.acceptedAt).to.be.a('string');
        expect(data.acceptOrDenyApplication.reason).to.equals('TEST');
    })

    it("Isn't denied member added into members?", async () => {
        const { members } = await presidentClient.request(membersQuery, {});
        
        expect(members).to.not.deep.include.members([{
            studentId: 20190101,
            name: '김김김',
            department: '만화창작학부',
            memberType: 'AssociateMember'
        }]);
    });

    it("Is it able to accept application form?", async () => {
        const { apply: applicationId } : { apply : string } = await request('http://127.0.0.1:4000', applyMutation, {
            form : {
                name: '김김김',
                department: '만화창작학부',
                studentId: 20190101,
                phoneNumber: '010-1111-2222',
                birthday: '2000-01-01'
            }
        });
        
        const data = await presidentClient.request(acceptOrDenyApplicationMutation, {
            accepts: true,
            applicationId,
            reason: 'TEST2'
        });
        
        expect(data).to.haveOwnProperty('acceptOrDenyApplication');
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('accepterId')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('accepted')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('applicationId')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('acceptedAt')
        expect(data.acceptOrDenyApplication).to.haveOwnProperty('reason')
        expect(data.acceptOrDenyApplication.accepterId).to.equals(presidentMemberId);
        expect(data.acceptOrDenyApplication.accepted).to.equals(true);
        expect(data.acceptOrDenyApplication.applicationId).to.equals(applicationId);
        expect(data.acceptOrDenyApplication.acceptedAt).to.be.a('string');
        expect(data.acceptOrDenyApplication.reason).to.equals('TEST2');
    });

    it("Is accepted member added into members?", async () => {
        const { members } = await presidentClient.request(membersQuery, {});
        
        expect(members).deep.include.members([{
            studentId: 20190101,
            name: '김김김',
            department: '만화창작학부',
            memberType: 'AssociateMember'
        }]);
    });
    

    it("Is it able to apply with removed information?", async () => {
        // 4st dummy member is removed member
        const {name, department, studentId, phoneNumber, birthday} = dummyServer.testMemberDatas[3];
        const data = await request('http://127.0.0.1:4000', applyMutation, {
            form : {
                name,
                department,
                studentId,
                phoneNumber,
                birthday: `${birthday.getFullYear()}-${(birthday.getMonth() + 1).toString().padStart(2, '0')}-${birthday.getDate().toString().padStart(2, '0')}`
            }
        });
        expect(data).to.haveOwnProperty('apply');
        expect(data.apply).to.be.a('string');
        expect(data.apply).not.be.empty;

        applicationFormId = data.apply;
    });

    it("Does applications query work well?", async () => {
        const data = await presidentClient.request(applicationsQuery);
        const {name, department, studentId, phoneNumber, birthday} = dummyServer.testMemberDatas[3];

        expect(data).to.haveOwnProperty('applications');
        expect(data.applications).to.be.a('array');
        
        let index: number | null = null;
        for (let i = 0; i < data.applications.length; i++)
            if (data.applications[i].applicationId === applicationFormId)
                index = i;
        
        if (index === null)
            throw new Error('Application with removed member info not found!');
        
        expect(data.applications[index]).haveOwnProperty('applicationId');
        expect(data.applications[index]).haveOwnProperty('reApplication');
        expect(data.applications[index]).haveOwnProperty('applicationDate');
        expect(data.applications[index]).haveOwnProperty('name');
        expect(data.applications[index]).haveOwnProperty('department');
        expect(data.applications[index]).haveOwnProperty('studentId');
        expect(data.applications[index]).haveOwnProperty('phoneNumber');
        expect(data.applications[index]).haveOwnProperty('birthday');
        expect(data.applications[index].applicationId).to.equals(applicationFormId);
        expect(data.applications[index].reApplication).to.equals(true);
        expect(data.applications[index].applicationDate).to.be.a('string');
        expect(data.applications[index].name).to.equals(name);
        expect(data.applications[index].department).to.equals(department);
        expect(data.applications[index].studentId).to.equals(studentId);
        expect(data.applications[index].phoneNumber).to.equals(phoneNumber.replace(/-/g, ''));
        expect(data.applications[index].birthday).to.equals(`${birthday.getFullYear()}-${(birthday.getMonth() + 1).toString().padStart(2, '0')}-${birthday.getDate().toString().padStart(2, '0')}`);
    });

    after("Close dummy server", async function () {
        await stopServer();
    })
})