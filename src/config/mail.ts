import type { ISmtpConfig } from '#/services/EmailService/smtp.provider';

import { env } from './env';

export const smtpConfig: ISmtpConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: !!env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
};

export const sendgridConfig = {
  key: env.SENDGRID_KEY,
};
