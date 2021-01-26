import { expect } from 'chai';
import request from 'graphql-request';
import * as dummyServer from './createDummy';
import { loginMutation } from './gqls';

describe('Authentication', () => {
  let graphQLServerUrl: string,
    stopServer: () => Promise<void>;
  before('Create dummy data', async function () {
    this.timeout(60000);
    const result = await dummyServer.createDummy();
    graphQLServerUrl =
      'http://127.0.0.1:' + result.graphQlServerPort;
    stopServer = result.stop;
  });

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

  after('Close dummy server', async function () {
    await stopServer();
  });
});
