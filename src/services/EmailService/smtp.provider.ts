import { createTransport } from 'nodemailer';

import { logError } from '../logger';
import { EmailServiceSender } from './send.dto';

export interface ISmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export function createTransporterSMTP(config: ISmtpConfig): EmailServiceSender {
  if (!config?.auth?.user || !config?.auth?.pass || !config?.host) {
    throw new Error('invalid_smtp_config');
  }
  const sender: EmailServiceSender = async ({ from, html, subject, to }) => {
    try {
      let transporter = createTransport(config);
      const response = await transporter.sendMail({ from, to, subject, html });
      transporter = null;
      return { ...response, method: 'smtp' };
    } catch (error) {
      logError('createTransporterSMTP', error?.message, error);
      return null;
    }
  };
  return sender;
}
