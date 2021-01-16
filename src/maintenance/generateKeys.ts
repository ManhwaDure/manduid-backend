import { promises as fs } from 'fs';
import inquirer from 'inquirer';
import jose from 'jose';
(async () => {
  const { keyFilePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'keyFilePath',
      message: 'Key file path?',
    },
  ]);
  const keystore = new jose.JWKS.KeyStore();

  await keystore.generate('RSA', 2048, { use: 'sig' });
  await keystore.generate('RSA', 2048, { use: 'enc' });
  await keystore.generate('EC', 'P-256', { use: 'sig' });
  await keystore.generate('EC', 'P-256', { use: 'enc' });
  await keystore.generate('OKP', 'Ed25519', { use: 'sig' });

  await fs.writeFile(
    keyFilePath,
    JSON.stringify(keystore.toJWKS(true), null, 2)
  );
})();
