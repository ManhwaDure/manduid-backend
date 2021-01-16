import {
  EmailTokenData,
  NewApplicationFormEmailDataType,
  SendEmailFunction,
} from './types';
import nodemailer from 'nodemailer';
import { EmailTemplateRenderer } from './emailTemplateRenderer';

const renderer = new EmailTemplateRenderer();
export const sendEmail: SendEmailFunction = async (
  email: string,
  receiverName: string,
  type:
    | 'VerificationEmail'
    | 'PasswordReset'
    | 'NewApplicationForm',
  data: EmailTokenData | NewApplicationFormEmailDataType
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: JSON.parse(process.env.SMTP_SECURE),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  switch (type) {
    case 'VerificationEmail': {
      const { token } = data as EmailTokenData;
      const verifyEmailAddressUrl = `https://id.caumd.club/verify_email/${encodeURIComponent(
        token
      )}`;
      const {
        text,
        html,
      } = await renderer.renderTextAndHtml(
        'VerificationEmail',
        { verifyEmailAddressUrl }
      );
      await transporter.sendMail({
        from: 'noreply@caumd.club',
        to: email,
        subject: '만화두레 이메일 인증',
        text,
        html,
        envelope: {
          from: '만화두레 <noreply@caumd.club>',
          to: `${receiverName} <${email}>`,
        },
      });
      break;
    }
    case 'PasswordReset': {
      const { token } = data as EmailTokenData;
      const resetPasswordUrl = `https://id.caumd.club/reset_password/${encodeURIComponent(
        token
      )}`;
      const {
        html,
        text,
      } = await renderer.renderTextAndHtml(
        'PasswordReset',
        { resetPasswordUrl }
      );
      await transporter.sendMail({
        from: 'noreply@caumd.club',
        to: email,
        subject: '만화두레 계정 비밀번호 초기화',
        text,
        html,
        envelope: {
          from: '만화두레 <noreply@caumd.club>',
          to: `${receiverName} <${email}>`,
        },
      });
      break;
    }
    case 'NewApplicationForm': {
      const {
        form,
        additionalAnswers,
        reApplication,
        applicationId,
        // formUrl
      } = data as NewApplicationFormEmailDataType;
      const formUrl = `https://id.caumd.club/admin/applications/${encodeURIComponent(
        applicationId
      )}`;

      const {
        html,
        text,
      } = await renderer.renderTextAndHtml(
        'NewApplicationForm',
        {
          form,
          additionalAnswers,
          reApplication,
          applicationId,
          formUrl,
        }
      );
      await transporter.sendMail({
        from: 'noreply@caumd.club',
        to: email,
        subject: `만화두레 신규 ${
          reApplication ? '재' : ''
        }입부원서`,
        text,
        html,
        envelope: {
          from: '만화두레 <noreply@caumd.club>',
          to: `${receiverName} <${email}>`,
        },
      });
    }
  }
};
