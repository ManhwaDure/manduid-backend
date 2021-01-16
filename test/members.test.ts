import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import request, { GraphQLClient } from "graphql-request";
import * as dummyServer from './createDummy';
import { loginMutation, membersQueryWithPrevRecords } from "./gqls";

chai.use(chaiAsPromised);
chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe("Member", () => {
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

    it('Does members query work well?', async function() {
        const { members } = await presidentClient.request(membersQueryWithPrevRecords);
        const testData = [];
        for (let i = 0; i < dummyServer.testMemberDatas.length; i++)
            testData.push({
                name: dummyServer.testMemberDatas[i].name,
                department: dummyServer.testMemberDatas[i].department,
                studentId: dummyServer.testMemberDatas[i].studentId,
                memberType: dummyServer.testMemberDatas[i].memberType,
                previousRecords: []
            });
        testData.push({
            name : dummyServer.testPresidentMemberData.name,
            department: dummyServer.testPresidentMemberData.department,
            studentId: dummyServer.testPresidentMemberData.studentId,
            memberType: dummyServer.testPresidentMemberData.memberType,
            previousRecords: []});
        expect(members).to.deep.equalInAnyOrder(testData);
    });


    after("Close dummy server", async function () {
        await stopServer();
    })
})