import imapSimple from 'imap-simple';
import { ParsedMail, simpleParser } from 'mailparser';

export const getImapEmail = (): Promise<ParsedMail[]> => {
  return new Promise((resolve, reject) => {
    imapSimple
      .connect({
        imap: {
          user: process.env.SMTP_USER,
          password: process.env.SMTP_PASS,
          host: process.env.IMAP_HOST,
          port: parseInt(process.env.IMAP_PORT),
          tls: JSON.parse(process.env.IMAP_SECURE),
        },
      })
      .then(async (imap) => {
        await imap.openBox('INBOX');
        const messages = await imap.search(['UNSEEN'], {
          bodies: ['HEADER', 'TEXT', ''],
          markSeen: true,
        });
        const result: ParsedMail[] = [];
        for (const message of messages) {
          for (const part of message.parts) {
            if (part.which !== '') continue;
            const parsedMail = await simpleParser(
              'Imap-Id: ' +
                message.attributes.uid +
                '\r\n' +
                part.body
            );
            result.push(parsedMail);
            break;
          }
        }
        resolve(result);
      })
      .catch(reject);
  });
};
