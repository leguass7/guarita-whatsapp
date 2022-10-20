import { createTransport } from 'nodemailer';

import type { LoggerService } from '../LoggerService';
import { EmailServiceSender } from './send.dto';

const cc = ['Leandro Sbrissa <leandro.sbrissa@hotmail.com>', 'Tcharly <tcharlyrocha@dessistemas.com.br>'];

export interface ISmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export function createTransporterSMTP(config: ISmtpConfig, loggerService?: LoggerService): EmailServiceSender {
  if (!config?.auth?.user || !config?.auth?.pass || !config?.host) {
    throw new Error(`invalid_smtp_config-${config?.auth?.user}-${config?.auth?.pass}-${config?.host}`);
  }

  const sender: EmailServiceSender = async ({ from, html, subject, to }) => {
    try {
      let transporter = createTransport(config);
      const response = await transporter.sendMail({ from, to, cc, subject, html });
      transporter = null;
      return { ...response, method: 'smtp' };
    } catch (error) {
      if (loggerService) loggerService.logError('createTransporterSMTP', error?.message, error);
      return null;
    }
  };
  return sender;
}
