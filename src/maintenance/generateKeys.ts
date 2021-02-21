import fs from 'fs';
import inquirer from 'inquirer';
import generateKeys from '../generateKeys';

(async () => {
  const { keyFilePath } = process.argv.includes(
    '--no-prompt'
  )
    ? { keyFilePath: process.env.OIDC_JWKS_PATH }
    : await inquirer.prompt([
        {
          type: 'input',
          name: 'keyFilePath',
          message: 'Key file path?',
        },
      ]);

  if (process.argv.includes('--skip-if-found')) {
    fs.stat(keyFilePath, async (err, stat) => {
      if (err?.code === 'ENOENT') {
        await generateKeys(keyFilePath);
      }
      process.exit(0);
    });
  } else {
    await generateKeys(keyFilePath);
    process.exit(0);
  }
})();
