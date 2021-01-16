import { expect } from "chai";
import request from "graphql-request";
import * as dummyServer from './createDummy';
import { loginMutation } from './gqls';

describe("Authentication", () => {
    let presidentMemberId: number, stopServer: () => Promise<void>;
    before("Create dummy data", async function () {
        this.timeout(60000);
        const result = await dummyServer.createDummy();
        presidentMemberId = result.presidentMemberId;
        stopServer = result.stop;
    });

    it("Is it able to login with president credentials?", async () => {
        const data = await request('http://127.0.0.1:4000', loginMutation, dummyServer.testPresidentCredential);
        expect(data).to.haveOwnProperty('login');
        expect(data.login).to.haveOwnProperty('success');
        expect(data.login).to.haveOwnProperty('token');
        expect(data.login.success).to.equals(true);
        expect(data.login.token).to.be.a("string");
        expect(data.login.token).not.to.be.empty;
    })
    it("Is it able to prevent login with incorrect president credentials?", async () => {
        const data = await request('http://127.0.0.1:4000', loginMutation, {
            id: dummyServer.testPresidentCredential.id,
            password: dummyServer.testPresidentCredential.password + '123'
        });
        expect(data).to.haveOwnProperty('login');
        expect(data.login).to.haveOwnProperty('success');
        expect(data.login).to.haveOwnProperty('token');
        expect(data.login.success).to.equals(false);
        expect(data.login.token).to.equals(null);
    })
    it("Is it able to prevent login with non-existed id?", async () => {
        const data = await request('http://127.0.0.1:4000', loginMutation, {
            id: '_______________________________________________________________NOTEXISTS',
            password: 'a'
        });
        expect(data).to.haveOwnProperty('login');
        expect(data.login).to.haveOwnProperty('success');
        expect(data.login).to.haveOwnProperty('token');
        expect(data.login.success).to.equals(false);
        expect(data.login.token).to.equals(null);
    })

    after("Close dummy server", async function () {
        await stopServer();
    })
})