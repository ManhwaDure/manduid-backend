import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import { GraphQLClient } from 'graphql-request';
import * as dummyServer from './createDummy';
import { membersQueryWithPrevRecords } from './gqls';

chai.use(chaiAsPromised);
chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe('Member', () => {
  let presidentClient: GraphQLClient,
    stopServer: () => Promise<void>;
  before('Create dummy data', async function () {
    this.timeout(60000);
    const result = await dummyServer.createDummy();
    presidentClient = await result.createPresidentalClient();
    stopServer = result.stop;
  });

  it('Does members query work well?', async function () {
    const { members } = await presidentClient.request(
      membersQueryWithPrevRecords
    );
    const testData = [];
    for (const i of dummyServer.memberTypes) {
      const {
        name,
        department,
        studentId,
        memberType,
      } = dummyServer.testMemberDatas[i];
      testData.push({
        name,
        department,
        studentId,
        memberType,
        previousRecords: [],
      });
    }
    testData.push({
      name: dummyServer.testPresidentMemberData.name,
      department:
        dummyServer.testPresidentMemberData.department,
      studentId:
        dummyServer.testPresidentMemberData.studentId,
      memberType:
        dummyServer.testPresidentMemberData.memberType,
      previousRecords: [],
    });
    expect(members).to.deep.equalInAnyOrder(testData);
  });

  after('Close dummy server', async function () {
    await stopServer();
  });
});
