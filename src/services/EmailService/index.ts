import { smtpConfig, sendgridConfig, env } from '#/config';
import type { LoggerService } from '#/services/LoggerService';

import { LogClass } from '../LoggerService/log-class.decorator';
import { EmailException } from './email.exception';
import { EmailServiceSender, SendPayloadDto, EmailServiceResponseDto, MailServiceProvider } from './send.dto';
import { createTransporterSG } from './sendgrid.provider';
import { createTransporterSMTP } from './smtp.provider';

export type { SendPayloadDto, EmailServiceResponseDto, MailServiceProvider };
export { EmailException } from './email.exception';

/**
 * @class MailService
 * @classdesc
 * Responsável por envio de e-mails
 * @description
 * Configure em `.env` a variável `MAIL_FROM`
 */
@LogClass
export class EmailService {
  public sender: EmailServiceSender;

  constructor(private provider: MailServiceProvider = 'smtp', private readonly loggerService: LoggerService) {
    if (provider === 'sendgrid' && !sendgridConfig?.key) throw new Error('invalid_sendgrid_config');
    if (provider === 'smtp') {
      if (!smtpConfig?.auth?.user || !smtpConfig?.auth?.pass || !smtpConfig?.host) {
        throw new Error(`invalid_smtp_config`);
      }
    }

    this.sender = this.provider === 'smtp' ? createTransporterSMTP(smtpConfig, this.loggerService) : createTransporterSG(sendgridConfig);
    return this;
  }

  async send(payload: SendPayloadDto) {
    const from = payload?.from || env?.MAIL_FROM || smtpConfig?.auth?.user;
    if (!from)
      throw new EmailException('invalid_mail_from', {
        from,
        to: payload?.to,
        subject: payload?.subject,
      });
    const response = await this.sender({ from, ...payload });
    return response;
  }
}
