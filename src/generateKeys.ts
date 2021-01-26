import { promises as fs } from 'fs';
import jose from 'jose';
export default async function (
  keyFilePath: string
): Promise<void> {
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
}
