import inquirer from 'inquirer';
import generateKeys from '../generateKeys';
(async () => {
  const { keyFilePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'keyFilePath',
      message: 'Key file path?',
    },
  ]);

  await generateKeys(keyFilePath);
})();
