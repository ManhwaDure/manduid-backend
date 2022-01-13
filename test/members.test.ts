import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import { GraphQLClient } from 'graphql-request';
import { isValidISODateString } from 'iso-datestring-validator';
import * as dummyServer from './createDummy';
import {
  createMemberMutation,
  getMemberByIdQuery,
  membersQueryWithPrevRecords,
  updateMemberMutation,
} from './gqls';

chai.use(chaiAsPromised);
chai.use(deepEqualInAnyOrder);
const { expect } = chai;

describe('Member', () => {
  let presidentClient: GraphQLClient,
    presidentMemberId: number,
    stopServer: () => Promise<void>;
  before('Create dummy data', async function () {
    this.timeout(60000);
    const result = await dummyServer.createDummy();
    presidentClient = await result.createPresidentalClient();
    presidentMemberId = result.presidentMemberId;
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

  const createMemberData = {
    birthday: '2000-01-01',
    department: '테스트작성학과',
    memberType: 'RegularMember',
    name: '김테스트',
    phoneNumber: '010-1234-4444',
    schoolRegisterationStatus: 'Enrolled',
    studentId: 20194344,
  };
  let createdMemberId: number = null;
  it('Does createMember mutation work well?', async function () {
    const data = await presidentClient.request(
      createMemberMutation,
      { data: createMemberData }
    );

    expect(data).to.haveOwnProperty('createMember');
    expect(data.createMember).to.haveOwnProperty(
      'birthday'
    );
    expect(data.createMember).to.haveOwnProperty(
      'department'
    );
    expect(data.createMember).to.haveOwnProperty(
      'memberType'
    );
    expect(data.createMember).to.haveOwnProperty('name');
    expect(data.createMember).to.haveOwnProperty(
      'phoneNumber'
    );
    expect(data.createMember).to.haveOwnProperty(
      'schoolRegisterationStatus'
    );
    expect(data.createMember).to.haveOwnProperty(
      'studentId'
    );
    expect(data.createMember.birthday).to.equal(
      createMemberData.birthday
    );
    expect(data.createMember.department).to.equal(
      createMemberData.department
    );
    expect(data.createMember.memberType).to.equal(
      createMemberData.memberType
    );
    expect(data.createMember.name).to.equal(
      createMemberData.name
    );
    expect(data.createMember.phoneNumber).to.equal(
      createMemberData.phoneNumber.replace(/-/g, '')
    );
    expect(
      data.createMember.schoolRegisterationStatus
    ).to.equal(createMemberData.schoolRegisterationStatus);
    expect(data.createMember.studentId).to.equal(
      createMemberData.studentId
    );
    expect(data.createMember.id).to.be.a('number');
    expect(data.createMember.id).not.to.be.null;
    createdMemberId = data.createMember.id;
  });

  it('Does getMemberById work well?', async function () {
    const data = await presidentClient.request(
      getMemberByIdQuery,
      { memberId: createdMemberId }
    );

    expect(data).to.haveOwnProperty('getMemberById');
    expect(data.getMemberById).to.haveOwnProperty(
      'birthday'
    );
    expect(data.getMemberById).to.haveOwnProperty(
      'department'
    );
    expect(data.getMemberById).to.haveOwnProperty(
      'memberType'
    );
    expect(data.getMemberById).to.haveOwnProperty('name');
    expect(data.getMemberById).to.haveOwnProperty(
      'phoneNumber'
    );
    expect(data.getMemberById).to.haveOwnProperty(
      'schoolRegisterationStatus'
    );
    expect(data.getMemberById).to.haveOwnProperty(
      'studentId'
    );
    expect(data.getMemberById.birthday).to.equal(
      createMemberData.birthday
    );
    expect(data.getMemberById.department).to.equal(
      createMemberData.department
    );
    expect(data.getMemberById.memberType).to.equal(
      createMemberData.memberType
    );
    expect(data.getMemberById.name).to.equal(
      createMemberData.name
    );
    expect(data.getMemberById.phoneNumber).to.equal(
      createMemberData.phoneNumber.replace(/-/g, '')
    );
    expect(
      data.getMemberById.schoolRegisterationStatus
    ).to.equal(createMemberData.schoolRegisterationStatus);
    expect(data.getMemberById.studentId).to.equal(
      createMemberData.studentId
    );
    expect(data.getMemberById.id).to.be.a('number');
    expect(data.getMemberById.id).to.equal(createdMemberId);
  });

  it('Does updateMember mutation work well?', async function () {
    const timeBeforeUpdate = Date.now();
    const updateMemberData = {
      birthday: '2002-03-04',
      department: '테스트업데이트학과',
      memberType: 'AssociateMember',
      name: '박테스트',
      phoneNumber: '010-1234-4444',
      schoolRegisterationStatus: 'Graduated',
      studentId: 20220001,
    };
    const updateReason = 'updateMember Mutation 테스트';
    const data = await presidentClient.request(
      updateMemberMutation,
      {
        memberId: createdMemberId,
        data: updateMemberData,
        reason: updateReason,
      }
    );

    expect(data).to.haveOwnProperty('updateMember');
    expect(data.updateMember).to.haveOwnProperty(
      'birthday'
    );
    expect(data.updateMember).to.haveOwnProperty(
      'department'
    );
    expect(data.updateMember).to.haveOwnProperty(
      'memberType'
    );
    expect(data.updateMember).to.haveOwnProperty('name');
    expect(data.updateMember).to.haveOwnProperty(
      'phoneNumber'
    );
    expect(data.updateMember).to.haveOwnProperty(
      'schoolRegisterationStatus'
    );
    expect(data.updateMember).to.haveOwnProperty(
      'studentId'
    );
    expect(data.updateMember.birthday).to.equal(
      updateMemberData.birthday
    );
    expect(data.updateMember.department).to.equal(
      updateMemberData.department
    );
    expect(data.updateMember.memberType).to.equal(
      updateMemberData.memberType
    );
    expect(data.updateMember.name).to.equal(
      updateMemberData.name
    );
    expect(data.updateMember.phoneNumber).to.equal(
      updateMemberData.phoneNumber.replace(/-/g, '')
    );
    expect(
      data.updateMember.schoolRegisterationStatus
    ).to.equal(updateMemberData.schoolRegisterationStatus);
    expect(data.updateMember.studentId).to.equal(
      updateMemberData.studentId
    );
    expect(data.updateMember.id).to.be.a('number');
    expect(data.updateMember.id).equals(createdMemberId);
    expect(data.updateMember).to.haveOwnProperty(
      'creatorId'
    );
    expect(data.updateMember.creatorId).to.equal(
      presidentMemberId
    );
    expect(data.updateMember).to.haveOwnProperty('creator');
    expect(data.updateMember.creator).to.haveOwnProperty(
      'id'
    );
    expect(data.updateMember.creator.id).to.equal(
      presidentMemberId
    );
    expect(data.updateMember).to.haveOwnProperty(
      'creationReason'
    );
    expect(data.updateMember.creationReason).to.equal(
      updateReason
    );
    expect(data.updateMember).to.haveOwnProperty(
      'createdAt'
    );
    expect(data.updateMember.createdAt).to.satisfy(
      isValidISODateString,
      'Not a valid ISO 8601 Timestamp'
    );
    expect(data.updateMember.createdAt).to.satisfy(
      (createdAt) => {
        return Date.parse(createdAt) > timeBeforeUpdate;
      },
      'createdAt is before creation'
    );
  });

  after('Close dummy server', async function () {
    await stopServer();
  });
});
