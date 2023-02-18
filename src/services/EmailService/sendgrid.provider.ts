import sgMail from '@sendgrid/mail';

import type { LoggerService } from '#/services/LoggerService';

import type { EmailServiceSender } from './send.dto';

const cc = undefined; //['Tcharly <tcharlyrocha@dessistemas.com.br>'];

export interface ISgConfig {
  key: string;
}

export function createTransporterSG(config: ISgConfig, loggerService?: LoggerService): EmailServiceSender {
  if (!config?.key) throw new Error('invalid_sendgrid_key');

  const sender: EmailServiceSender = async ({ from, html, subject, to }) => {
    try {
      sgMail.setApiKey(config.key);
      const [info] = (await sgMail.send({ from, to, subject, cc, html })) || [];
      const messageId = info?.['headers']?.['x-message-id'];
      return { messageId, method: 'sendgrid', status: info?.statusCode };
    } catch (error) {
      loggerService.logError('createTransporterSG', error?.response?.body || error?.message || error?.code);
      return null;
    }
  };
  return sender;
}
