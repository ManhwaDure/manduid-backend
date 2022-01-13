import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import request, { GraphQLClient } from 'graphql-request';
import * as dummyServer from './createDummy';
import {
  acceptOrDenyApplicationMutation,
  applicationFormAdditionalQuestionsQuery,
  applicationsQuery,
  applyMutation,
  createApplicationFormAdditionalQuestionMutation,
  deleteApplicationFormAdditionalQuestionMutation,
  getApplicationByIdQuery,
  membersQuery,
} from './gqls';
import { toISODateString } from './utils';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Application', () => {
  let presidentMemberId: number,
    graphQLServerUrl: string,
    stopServer: () => Promise<void>,
    presidentClient: GraphQLClient;

  before('Create dummy data', async function () {
    this.timeout(60000);
    const result = await dummyServer.createDummy();
    presidentMemberId = result.presidentMemberId;
    graphQLServerUrl = `http://127.0.0.1:${result.graphQlServerPort}`;
    presidentClient = await result.createPresidentalClient();
    stopServer = result.stop;
  });

  let applicationFormId: string;
  it('Is it able to apply?', async () => {
    const form = {
      name: '김김김',
      department: '만화창작학부',
      studentId: 20190101,
      phoneNumber: '010-1111-2222',
      birthday: '2000-01-01',
    };
    const data = await request(
      graphQLServerUrl,
      applyMutation,
      {
        form,
      }
    );
    expect(data).to.haveOwnProperty('apply');
    expect(data.apply).to.haveOwnProperty('applicationId');
    expect(data.apply).to.haveOwnProperty('birthday');
    expect(data.apply).to.haveOwnProperty('department');
    expect(data.apply).to.haveOwnProperty('name');
    expect(data.apply).to.haveOwnProperty('phoneNumber');
    expect(data.apply).to.haveOwnProperty('reApplication');
    expect(data.apply).to.haveOwnProperty('studentId');
    expect(data.apply.applicationId).to.be.a('string');
    expect(data.apply.birthday).to.equal(form.birthday);
    expect(data.apply.department).to.equal(form.department);
    expect(data.apply.name).to.equal(form.name);
    expect(data.apply.phoneNumber).to.equal(
      form.phoneNumber.replace(/-/g, '')
    );
    expect(data.apply.reApplication).to.equal(false);
    expect(data.apply.studentId).to.equal(form.studentId);

    applicationFormId = data.apply.applicationId;
  });

  it('Is it unable to apply with existed-member?', async () => {
    const {
      name,
      department,
      studentId,
      phoneNumber,
      birthday,
    } = dummyServer.testMemberDatas.AssociateMember;
    const dataPromise = request(
      graphQLServerUrl,
      applyMutation,
      {
        form: {
          name,
          department,
          studentId,
          phoneNumber,
          birthday: toISODateString(birthday),
        },
      }
    );
    expect(dataPromise).to.eventually.be.rejected;
  });

  it('Is it unable to apply with expulsed member?', async () => {
    const {
      name,
      department,
      studentId,
      phoneNumber,
      birthday,
    } = dummyServer.testMemberDatas.Explusion;
    const dataPromise = request(
      graphQLServerUrl,
      applyMutation,
      {
        form: {
          name,
          department,
          studentId,
          phoneNumber,
          birthday: toISODateString(birthday),
        },
      }
    );
    expect(dataPromise).to.eventually.be.rejected;
  });

  it('Is it able to deny application form?', async () => {
    const applicationId = applicationFormId;
    const data = await presidentClient.request(
      acceptOrDenyApplicationMutation,
      {
        accepts: false,
        applicationId,
        reason: 'TEST',
      }
    );

    expect(data).to.haveOwnProperty(
      'acceptOrDenyApplication'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'accepterId'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'accepted'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'applicationId'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'acceptedAt'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'reason'
    );
    expect(
      data.acceptOrDenyApplication.accepterId
    ).to.equals(presidentMemberId);
    expect(data.acceptOrDenyApplication.accepted).to.equals(
      false
    );
    expect(
      data.acceptOrDenyApplication.applicationId
    ).to.equals(applicationId);
    expect(data.acceptOrDenyApplication.acceptedAt).to.be.a(
      'string'
    );
    expect(data.acceptOrDenyApplication.reason).to.equals(
      'TEST'
    );
  });

  it("Isn't denied member added into members?", async () => {
    const { members } = await presidentClient.request(
      membersQuery,
      {}
    );

    expect(members).to.not.deep.include.members([
      {
        studentId: 20190101,
        name: '김김김',
        department: '만화창작학부',
        memberType: 'AssociateMember',
      },
    ]);
  });

  it('Is it able to accept application form?', async () => {
    const { apply } = await request(
      graphQLServerUrl,
      applyMutation,
      {
        form: {
          name: '김김김',
          department: '만화창작학부',
          studentId: 20190101,
          phoneNumber: '010-1111-2222',
          birthday: '2000-01-01',
        },
      }
    );

    const applicationId = apply.applicationId;
    const data = await presidentClient.request(
      acceptOrDenyApplicationMutation,
      {
        accepts: true,
        applicationId,
        reason: 'TEST2',
      }
    );

    expect(data).to.haveOwnProperty(
      'acceptOrDenyApplication'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'accepterId'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'accepted'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'applicationId'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'acceptedAt'
    );
    expect(data.acceptOrDenyApplication).to.haveOwnProperty(
      'reason'
    );
    expect(
      data.acceptOrDenyApplication.accepterId
    ).to.equals(presidentMemberId);
    expect(data.acceptOrDenyApplication.accepted).to.equals(
      true
    );
    expect(
      data.acceptOrDenyApplication.applicationId
    ).to.equals(applicationId);
    expect(data.acceptOrDenyApplication.acceptedAt).to.be.a(
      'string'
    );
    expect(data.acceptOrDenyApplication.reason).to.equals(
      'TEST2'
    );
  });

  it('Is accepted member added into members?', async () => {
    const { members } = await presidentClient.request(
      membersQuery,
      {}
    );

    expect(members).deep.include.members([
      {
        studentId: 20190101,
        name: '김김김',
        department: '만화창작학부',
        memberType: 'AssociateMember',
      },
    ]);
  });

  it('Is it able to apply with removed information?', async () => {
    const {
      name,
      department,
      studentId,
      phoneNumber,
      birthday,
    } = dummyServer.testMemberDatas.Removed;
    const data = await request(
      graphQLServerUrl,
      applyMutation,
      {
        form: {
          name,
          department,
          studentId,
          phoneNumber,
          birthday: toISODateString(birthday),
        },
      }
    );
    expect(data).to.haveOwnProperty('apply');
    expect(data.apply).to.haveOwnProperty('applicationId');

    applicationFormId = data.apply.applicationId;
  });

  it('Does applications query work well?', async () => {
    const data = await presidentClient.request(
      applicationsQuery
    );
    const {
      name,
      department,
      studentId,
      phoneNumber,
      birthday,
    } = dummyServer.testMemberDatas.Removed;

    expect(data).to.haveOwnProperty('applications');
    expect(data.applications).to.be.a('array');

    let index: number | null = null;
    for (let i = 0; i < data.applications.length; i++)
      if (
        data.applications[i].applicationId ===
        applicationFormId
      )
        index = i;

    if (index === null)
      throw new Error(
        'Application with removed member info not found!'
      );

    expect(data.applications[index]).haveOwnProperty(
      'applicationId'
    );
    expect(data.applications[index]).haveOwnProperty(
      'reApplication'
    );
    expect(data.applications[index]).haveOwnProperty(
      'applicationDate'
    );
    expect(data.applications[index]).haveOwnProperty(
      'name'
    );
    expect(data.applications[index]).haveOwnProperty(
      'department'
    );
    expect(data.applications[index]).haveOwnProperty(
      'studentId'
    );
    expect(data.applications[index]).haveOwnProperty(
      'phoneNumber'
    );
    expect(data.applications[index]).haveOwnProperty(
      'birthday'
    );
    expect(
      data.applications[index].applicationId
    ).to.equals(applicationFormId);
    expect(
      data.applications[index].reApplication
    ).to.equals(true);
    expect(
      data.applications[index].applicationDate
    ).to.be.a('string');
    expect(data.applications[index].name).to.equals(name);
    expect(data.applications[index].department).to.equals(
      department
    );
    expect(data.applications[index].studentId).to.equals(
      studentId
    );
    expect(data.applications[index].phoneNumber).to.equals(
      phoneNumber.replace(/-/g, '')
    );
    expect(data.applications[index].birthday).to.equals(
      toISODateString(birthday)
    );
  });

  describe('Additional questions', () => {
    const requiredQuestion = {
        id: '',
        question: 'Answer this plz',
        required: true,
      },
      optionalQuestion = {
        id: '',
        question: 'Answer this if you want plz',
        required: false,
      },
      deletedQuestion = {
        id: '',
        question: 'Do not answer this plz',
        required: true,
      };
    it('Is it able to create optional additional question?', async () => {
      const { question, required } = optionalQuestion;
      const data = await presidentClient.request(
        createApplicationFormAdditionalQuestionMutation,
        { question, required }
      );

      expect(data).to.haveOwnProperty(
        'createApplicationFormAdditionalQuestion'
      );
      expect(
        data.createApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('question');
      expect(
        data.createApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('required');
      expect(
        data.createApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('id');
      expect(
        data.createApplicationFormAdditionalQuestion
          .question
      ).to.equal(question);
      expect(
        data.createApplicationFormAdditionalQuestion
          .required
      ).to.equal(required);
      expect(
        data.createApplicationFormAdditionalQuestion.id
      ).to.be.a('string');
      expect(
        data.createApplicationFormAdditionalQuestion.id
      ).not.to.be.empty;
      optionalQuestion.id =
        data.createApplicationFormAdditionalQuestion.id;
    });
    it('Is it able to create required additional question?', async () => {
      const { question, required } = requiredQuestion;
      const data = await presidentClient.request(
        createApplicationFormAdditionalQuestionMutation,
        { question, required }
      );

      expect(data).to.haveOwnProperty(
        'createApplicationFormAdditionalQuestion'
      );
      expect(
        data.createApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('question');
      expect(
        data.createApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('required');
      expect(
        data.createApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('id');
      expect(
        data.createApplicationFormAdditionalQuestion
          .question
      ).to.equal(question);
      expect(
        data.createApplicationFormAdditionalQuestion
          .required
      ).to.equal(required);
      expect(
        data.createApplicationFormAdditionalQuestion.id
      ).to.be.a('string');
      expect(
        data.createApplicationFormAdditionalQuestion.id
      ).not.to.be.empty;
      requiredQuestion.id =
        data.createApplicationFormAdditionalQuestion.id;
    });
    it('Is it able to delete additional question?', async () => {
      const { question, required } = deletedQuestion;
      const createData = await presidentClient.request(
        createApplicationFormAdditionalQuestionMutation,
        { question, required }
      );

      deletedQuestion.id =
        createData.createApplicationFormAdditionalQuestion.id;

      const deleteData = await presidentClient.request(
        deleteApplicationFormAdditionalQuestionMutation,
        {
          id: deletedQuestion.id,
        }
      );

      expect(deleteData).to.haveOwnProperty(
        'deleteApplicationFormAdditionalQuestion'
      );
      expect(
        deleteData.deleteApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('id');
      expect(
        deleteData.deleteApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('question');
      expect(
        deleteData.deleteApplicationFormAdditionalQuestion
      ).to.haveOwnProperty('required');
      expect(
        deleteData.deleteApplicationFormAdditionalQuestion
          .id
      ).to.equal(deletedQuestion.id);
      expect(
        deleteData.deleteApplicationFormAdditionalQuestion
          .question
      ).to.equal(deletedQuestion.question);
      expect(
        deleteData.deleteApplicationFormAdditionalQuestion
          .required
      ).to.equal(deletedQuestion.required);
    });
    it('Does applicationFormAdditionalQuestions query work well?', async () => {
      const data = await request(
        graphQLServerUrl,
        applicationFormAdditionalQuestionsQuery
      );

      expect(data).to.haveOwnProperty(
        'applicationFormAdditionalQuestions'
      );
      expect(
        data.applicationFormAdditionalQuestions
      ).to.be.a('array');
      expect(
        data.applicationFormAdditionalQuestions
      ).to.have.deep.members([
        optionalQuestion,
        requiredQuestion,
      ]);
    });

    const form = {
      name: '김김추가',
      department: '만화창작학부',
      studentId: 20200101,
      phoneNumber: '010-1111-2222',
      birthday: '2000-01-01',
    };
    it('Is it unable to apply with answers to deleted questions?', async () => {
      const applicationRequest = request(
        graphQLServerUrl,
        applyMutation,
        {
          form,
          additionalAnswers: [
            {
              questionId: deletedQuestion.id,
              answer: 'aaaaaaaa',
            },
            {
              questionId: requiredQuestion.id,
              answer: 'bbbbbbbbbbb',
            },
          ],
        }
      );

      expect(applicationRequest).to.eventually.be.rejected;
    });
    it('Is it unable to apply without answers to required questions?', async () => {
      const applicationRequest = request(
        graphQLServerUrl,
        applyMutation,
        {
          form,
          additionalAnswers: [
            {
              questionId: optionalQuestion.id,
              answer: 'bbbbbbbbbbb',
            },
          ],
        }
      );

      expect(applicationRequest).to.eventually.be.rejected;
    });
    it('Is it unable to apply with empty answers to required questions?', async () => {
      const applicationRequest = request(
        graphQLServerUrl,
        applyMutation,
        {
          form,
          additionalAnswers: [
            {
              questionId: requiredQuestion.id,
              answer: '',
            },
          ],
        }
      );

      expect(applicationRequest).to.eventually.be.rejected;
    });

    let applicationIdWithAdditionalAnswers = '';
    it('Is it able to apply with additional answers?', async () => {
      const data = await request(
        graphQLServerUrl,
        applyMutation,
        {
          form: {
            name: '김김추가',
            department: '만화창작학부',
            studentId: 20200101,
            phoneNumber: '010-1111-2222',
            birthday: '2000-01-01',
          },
          additionalAnswers: [
            {
              questionId: requiredQuestion.id,
              answer: 'Required!',
            },
            {
              questionId: optionalQuestion.id,
              answer: 'Optional!',
            },
          ],
        }
      );

      expect(data).to.haveOwnProperty('apply');
      expect(data.apply).to.haveOwnProperty(
        'applicationId'
      );
      expect(data.apply.applicationId).to.be.a('string');
      expect(data.apply.applicationId).not.to.be.empty;

      applicationIdWithAdditionalAnswers =
        data.apply.applicationId;
    });

    it('Is application with additional answers queried well?', async () => {
      const data = await presidentClient.request(
        getApplicationByIdQuery,
        {
          applicationId: applicationIdWithAdditionalAnswers,
        }
      );

      expect(data).to.haveOwnProperty('getApplicationById');
      expect(data.getApplicationById).to.haveOwnProperty(
        'applicationId'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'reApplication'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'name'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'department'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'studentId'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'phoneNumber'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'birthday'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'applicationDate'
      );
      expect(data.getApplicationById).to.haveOwnProperty(
        'additionalAnswers'
      );
      expect(
        data.getApplicationById.applicationId
      ).to.equal(applicationIdWithAdditionalAnswers);
      expect(
        data.getApplicationById.reApplication
      ).to.equal(false);
      expect(data.getApplicationById.name).to.equal(
        form.name
      );
      expect(data.getApplicationById.department).to.equal(
        form.department
      );
      expect(data.getApplicationById.studentId).to.equal(
        form.studentId
      );
      expect(data.getApplicationById.phoneNumber).to.equal(
        form.phoneNumber.replace(/-/g, '')
      );
      expect(data.getApplicationById.birthday).to.equal(
        form.birthday
      );
      expect(
        data.getApplicationById.additionalAnswers
      ).to.be.a('array');
      expect(
        data.getApplicationById.additionalAnswers
      ).to.have.deep.members([
        {
          answer: 'Required!',
          applicationId: applicationIdWithAdditionalAnswers,
          question: requiredQuestion,
        },
        {
          answer: 'Optional!',
          applicationId: applicationIdWithAdditionalAnswers,
          question: optionalQuestion,
        },
      ]);
    });
  });

  after('Close dummy server', async function () {
    await stopServer();
  });
});
