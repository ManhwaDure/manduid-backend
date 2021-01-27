import { PrismaClient } from '@prisma/client';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import request, { GraphQLClient } from 'graphql-request';
import * as dummyServer from './createDummy';
import {
  changePasswordMutation,
  forgotPasswordMutation,
  loginMutation,
  resetPasswordMutation,
  signUpMutations,
} from './gqls';
import { getImapEmail } from './utils';
chai.use(chaiAsPromised);
const { expect } = chai;

describe('Authentication', () => {
  let graphQLServerUrl: string,
    stopServer: () => Promise<void>,
    presidentClient: GraphQLClient;
  before('Create dummy data', async function () {
    this.timeout(60000);
    const result = await dummyServer.createDummy();
    graphQLServerUrl =
      'http://127.0.0.1:' + result.graphQlServerPort;
    stopServer = result.stop;
    presidentClient = await result.createPresidentalClient();
  });

  describe('Login', () => {
    it('Is it able to login with president credentials?', async () => {
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        dummyServer.testPresidentCredential
      );
      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equals(true);
      expect(data.login.token).to.be.a('string');
      expect(data.login.token).not.to.be.empty;
    });
    it('Is it able to prevent login with incorrect president credentials?', async () => {
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        {
          id: dummyServer.testPresidentCredential.id,
          password:
            dummyServer.testPresidentCredential.password +
            '123',
        }
      );
      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equals(false);
      expect(data.login.token).to.equals(null);
    });
    it('Is it able to prevent login with non-existed id?', async () => {
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        {
          id:
            '_______________________________________________________________NOTEXISTS',
          password: 'a',
        }
      );
      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equals(false);
      expect(data.login.token).to.equals(null);
    });
    it("Is it able to prevent login with removed member's id?", async () => {
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        dummyServer.testCredentials.Removed
      );
      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equals(false);
      expect(data.login.token).to.equals(null);
    });
    it("Is it able to prevent login with explused member's id?", async () => {
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        dummyServer.testCredentials.Explusion
      );
      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equals(false);
      expect(data.login.token).to.equals(null);
    });
  });
  describe('Sign Up', () => {
    const memberData: dummyServer.MemberTestData = {
      name: '김계정',
      phoneNumber: '010-9999-7777',
      birthday: new Date(2007, 1, 1),
      creationReason: '',
      department: '계정생성학과',
      isPresident: false,
      memberType: 'RegularMember',
      schoolRegisterationStatus: 'Enrolled',
      studentId: 20078765,
    };

    before('Create test member data', async () => {
      const prisma = new PrismaClient();
      await prisma.member.create({
        data: memberData,
      });
    });

    it('Is it unable to sign up with non-existed member?', async () => {
      const data = await request(
        graphQLServerUrl,
        signUpMutations.verifyMembershipMutation,
        {
          name: '아아아아아',
          phoneNumber: '011-9999-7777',
          studentId: 20008765,
        }
      );
      expect(data).to.haveOwnProperty(
        'signUp_verifyMembership'
      );
      expect(data.signUp_verifyMembership).to.equal(null);
    });

    it('Does it throw an error when trying to create one more account?', async () => {
      const {
        name,
        phoneNumber,
        studentId,
      } = dummyServer.testPresidentMemberData;
      const verifyMembershipRequest = request(
        graphQLServerUrl,
        signUpMutations.verifyMembershipMutation,
        {
          name,
          phoneNumber,
          studentId,
        }
      );
      expect(verifyMembershipRequest).to.be.eventually
        .rejected;
    });

    let membershipVerificationToken;
    it('Is it able to create membership verification token?', async () => {
      const { name, phoneNumber, studentId } = memberData;
      const data = await request(
        graphQLServerUrl,
        signUpMutations.verifyMembershipMutation,
        {
          name,
          phoneNumber,
          studentId,
        }
      );
      expect(data).to.haveOwnProperty(
        'signUp_verifyMembership'
      );
      expect(data.signUp_verifyMembership).to.be.a(
        'string'
      );
      membershipVerificationToken =
        data.signUp_verifyMembership;
    });

    const createIdData = {
      emailAddress: 'somespaghetti@cau.ac.kr',
      id: 'somespa',
      password: 'somespa123',
    };
    it('Does it throw an error when trying non-cau email', async () => {
      const { id, password } = createIdData;
      const createIdRequest = request(
        graphQLServerUrl,
        signUpMutations.createIdMutation,
        {
          id,
          password,
          membershipVerificationToken,
          emailAddress: 'noncau@example.com',
        }
      );
      expect(createIdRequest).to.eventually.be.rejected;
    });
    it('Does it throw an error when trying non-allowed id', async () => {
      const { emailAddress, password } = createIdData;
      const createIdRequest = request(
        graphQLServerUrl,
        signUpMutations.createIdMutation,
        {
          emailAddress,
          id: '+*_*08Az,.<>',
          password,
          membershipVerificationToken,
        }
      );
      expect(createIdRequest).to.eventually.be.rejected;
    });
    it('Does it throw an error when trying password shorter than 5 characters?', async () => {
      const { emailAddress, id } = createIdData;
      const createIdRequest = request(
        graphQLServerUrl,
        signUpMutations.createIdMutation,
        {
          emailAddress,
          id,
          password: 'abcd',
          membershipVerificationToken,
        }
      );
      expect(createIdRequest).to.eventually.be.rejected;
    });
    it('Does it throw an error when trying wrong membership verification token?', async () => {
      const { emailAddress, id } = createIdData;
      const createIdRequest = request(
        graphQLServerUrl,
        signUpMutations.createIdMutation,
        {
          emailAddress,
          id,
          password: 'abcd',
          membershipVerificationToken:
            membershipVerificationToken +
            '_' +
            membershipVerificationToken +
            '_0',
        }
      );
      expect(createIdRequest).to.eventually.be.rejected;
    });

    let resendEmailToken;
    it('It it able to send id creation request?', async function () {
      this.timeout(10000);
      const { emailAddress, id, password } = createIdData;
      const data = await request(
        graphQLServerUrl,
        signUpMutations.createIdMutation,
        {
          emailAddress,
          id,
          password,
          membershipVerificationToken,
        }
      );
      expect(data).to.haveOwnProperty('signUp_createId');
      expect(data.signUp_createId).to.be.a('string');
      resendEmailToken = data.signUp_createId;
    });

    let emailVerificationToken;
    it('Has the verification email arrvied?', function (done) {
      this.timeout(1000 * 60 * 3);
      const now = Date.now();
      const check = async () => {
        const emails = await getImapEmail();
        for (const email of emails) {
          if (
            email.text.includes(
              'https://id.caumd.club/verify_email/'
            ) &&
            email.html
              .toString()
              .includes(
                'https://id.caumd.club/verify_email/'
              )
          ) {
            emailVerificationToken = decodeURIComponent(
              /https:\/\/id\.caumd\.club\/verify_email\/([^\s]+)/.exec(
                email.text
              )[1]
            );
            expect(emailVerificationToken).to.be.a(
              'string'
            );
            expect(emailVerificationToken).not.to.be.empty;
            done();
            return;
          }
        }
        if (Date.now() - now < 1000 * 60 * 3)
          setTimeout(check, 500);
        else done(new Error('Verification mail not found'));
      };
      setImmediate(check);
    });

    it('Is it able to resend verification email?', async function () {
      this.timeout(10000);
      const data = await request(
        graphQLServerUrl,
        signUpMutations.resendVerificationEmailMutation,
        {
          token: resendEmailToken,
        }
      );
      expect(data).to.haveOwnProperty(
        'resendVerificationEmail'
      );
      expect(data.resendVerificationEmail).to.be.a(
        'string'
      );
      resendEmailToken = data.resendVerificationEmail;
    });

    let emailVerificationTokenBefore;
    it('Has the verification email resent?', function (done) {
      this.timeout(1000 * 60 * 3);
      emailVerificationTokenBefore = emailVerificationToken;
      const now = Date.now();
      const check = async () => {
        const emails = await getImapEmail();
        for (const email of emails) {
          if (
            email.text.includes(
              'https://id.caumd.club/verify_email/'
            ) &&
            email.html
              .toString()
              .includes(
                'https://id.caumd.club/verify_email/'
              )
          ) {
            emailVerificationToken = decodeURIComponent(
              /https:\/\/id\.caumd\.club\/verify_email\/([^\s]+)/.exec(
                email.text
              )[1]
            );
            expect(emailVerificationToken).to.be.a(
              'string'
            );
            expect(emailVerificationToken).not.to.be.empty;
            expect(emailVerificationToken).not.to.equal(
              emailVerificationTokenBefore
            );
            done();
            return;
          }
        }
        if (Date.now() - now < 1000 * 60 * 3)
          setTimeout(check, 500);
        else done(new Error('Verification mail not found'));
      };
      setImmediate(check);
    });

    it('Is it unable to verify email with invalidated verification token?', async () => {
      const verifyEmailRequest = request(
        graphQLServerUrl,
        signUpMutations.verifyEmailMutation,
        {
          verificationToken: emailVerificationTokenBefore,
        }
      );
      expect(verifyEmailRequest).to.eventually.be.rejected;
    });

    it('Is it able to verify email with valid verification token?', async () => {
      const data = await request(
        graphQLServerUrl,
        signUpMutations.verifyEmailMutation,
        {
          verificationToken: emailVerificationToken,
        }
      );
      expect(data).to.haveOwnProperty('signUp_verifyEmail');
      expect(data.signUp_verifyEmail).to.be.a('string');
      expect(data.signUp_verifyEmail).to.equal(
        createIdData.id
      );
    });

    it('Is it able to login with created account?', async () => {
      const { id, password } = createIdData;
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        {
          id,
          password,
        }
      );
      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equals(true);
      expect(data.login.token).to.be.a('string');
    });
  });
  describe('Change password', () => {
    it('Is it unable to change password when entered incorrect password?', async () => {
      const {
        password: oldPassword,
      } = dummyServer.testPresidentCredential;
      const changePasswordRequest = presidentClient.request(
        changePasswordMutation,
        {
          oldPassword: oldPassword + '_',
          newPassword: oldPassword + '_' + oldPassword,
        }
      );

      expect(changePasswordRequest).to.eventually.be
        .rejected;
    });
    it('Is it unable to change password with new password shorter than 5 characters?', async () => {
      const {
        password: oldPassword,
      } = dummyServer.testPresidentCredential;
      const changePasswordRequest = presidentClient.request(
        changePasswordMutation,
        {
          oldPassword,
          newPassword: 'abcd',
        }
      );

      expect(changePasswordRequest).to.eventually.be
        .rejected;
    });
    it('Is it able to change password?', async () => {
      const {
        password: oldPassword,
      } = dummyServer.testPresidentCredential;

      const data = await presidentClient.request(
        changePasswordMutation,
        {
          oldPassword,
          newPassword: oldPassword + '_123',
        }
      );

      expect(data).to.haveOwnProperty('changePassword');
      expect(data.changePassword).to.equal(true);
    });
    it('Is it able to login with new password?', async () => {
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        {
          id: dummyServer.testPresidentCredential.id,
          password:
            dummyServer.testPresidentCredential.password +
            '_123',
        }
      );

      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equal(true);
      expect(data.login.token).to.be.a('string');
      expect(data.login.token).not.to.be.empty;
    });
  });
  describe('Reset password', () => {
    it('Is it unable to reset password with non-existed email?', async () => {
      const data = await request(
        graphQLServerUrl,
        forgotPasswordMutation,
        {
          emailAddress: '____NONEXISTSED____@cau.ac.kr',
        }
      );

      expect(data).to.haveOwnProperty('forgotPassword');
      expect(data.forgotPassword).to.equal(false);
    });
    it('Is it able to send forgot-password mail?', async function () {
      this.timeout(1000 * 10);
      const data = await request(
        graphQLServerUrl,
        forgotPasswordMutation,
        {
          emailAddress:
            dummyServer.testMemberEmails.RegularMember,
        }
      );

      expect(data).to.haveOwnProperty('forgotPassword');
      expect(data.forgotPassword).to.equal(true);
    });

    let resetToken: string;
    it('Has password-reset token arrived?', function (done) {
      this.timeout(1000 * 12);
      const repeatUntil = Date.now() + 1000 * 10;
      const check = async () => {
        if (Date.now() >= repeatUntil)
          return done(
            new Error('Password-reset mail not found')
          );

        const mails = await getImapEmail();
        for (const mail of mails) {
          if (
            mail.text.includes(
              'https://id.caumd.club/reset_password/'
            ) &&
            mail.html
              .toString()
              .includes(
                'https://id.caumd.club/reset_password/'
              )
          ) {
            resetToken = decodeURIComponent(
              /https:\/\/id\.caumd\.club\/reset_password\/([^\s]+)/.exec(
                mail.text
              )[1]
            );
            return done();
          }
        }
        if (Date.now() < repeatUntil) {
          setTimeout(check, 500);
        }
      };
      setImmediate(check);
    });

    const newPassword =
      dummyServer.testCredentials.RegularMember +
      '_changed';
    it('Is it unable to reset password with incorrect token?', async () => {
      const data = await request(
        graphQLServerUrl,
        resetPasswordMutation,
        {
          resetToken: resetToken + '_' + resetToken,
          newPassword,
        }
      );

      expect(data).to.haveOwnProperty('resetPassword');
      expect(data.resetPassword).to.equal(false);
    });
    it('Is it unable to reset password to passwrod shorter than 5 characters?', async () => {
      const resetPasswordRequest = request(
        graphQLServerUrl,
        resetPasswordMutation,
        {
          resetToken,
          newPassword: 'abcd',
        }
      );

      expect(resetPasswordRequest).to.eventually.be
        .rejected;
    });
    it('Is it able to reset password with token?', async () => {
      const data = await request(
        graphQLServerUrl,
        resetPasswordMutation,
        {
          resetToken,
          newPassword,
        }
      );

      expect(data).to.haveOwnProperty('resetPassword');
      expect(data.resetPassword).to.equal(true);
    });
    it('Is it able to login with new password?', async () => {
      const data = await request(
        graphQLServerUrl,
        loginMutation,
        {
          id: dummyServer.testCredentials.RegularMember.id,
          password: newPassword,
        }
      );

      expect(data).to.haveOwnProperty('login');
      expect(data.login).to.haveOwnProperty('success');
      expect(data.login).to.haveOwnProperty('token');
      expect(data.login.success).to.equal(true);
      expect(data.login.token).to.be.a('string');
      expect(data.login.token).not.to.be.empty;
    });
  });

  after('Close dummy server', async function () {
    await stopServer();
  });
});
