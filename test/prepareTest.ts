import dotenv from 'dotenv';
import dotenvStringify from 'dotenv-stringify';
import fs from 'fs/promises';
import getPort from 'get-port';
import nodemailer from 'nodemailer';
import { join } from 'path';
import generateKeys from '../src/generateKeys';

(async () => {
  const testEnvFilePath = join(
    __dirname,
    '../env/.env.test'
  );
  const testEnvFile = await fs.readFile(testEnvFilePath, {
    encoding: 'utf8',
  });

  const testEnv = dotenv.parse(testEnvFile);
  await generateKeys(testEnv.OIDC_JWKS_PATH);
  // Set ports randomly
  testEnv.HTTP_PORT = (await getPort()).toString();
  testEnv.GRAPHQL_PORT = (await getPort()).toString();
  testEnv.HTTP_API_ENDPOINT =
    'http://127.0.0.1:' + testEnv.HTTP_PORT;

  // Create test smtp account
  const etherealEmail = await nodemailer.createTestAccount();
  testEnv.SMTP_HOST = etherealEmail.smtp.host;
  testEnv.SMTP_PORT = etherealEmail.smtp.port.toString();
  testEnv.SMTP_SECURE = JSON.stringify(
    etherealEmail.smtp.secure
  );
  testEnv.SMTP_USER = etherealEmail.user;
  testEnv.SMTP_PASS = etherealEmail.pass;

  // These variables are used for checking with imap
  testEnv.IMAP_HOST = etherealEmail.imap.host;
  testEnv.IMAP_PORT = etherealEmail.imap.port.toString();
  testEnv.IMAP_SECURE = JSON.stringify(
    etherealEmail.imap.secure
  );

  // SET NODE_ENV to Development
  testEnv.NODE_ENV = 'development';

  await fs.writeFile(
    testEnvFilePath,
    dotenvStringify(testEnv),
    { encoding: 'utf8' }
  );
})();
