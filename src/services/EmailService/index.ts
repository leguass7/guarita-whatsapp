import { smtpConfig, sendgridConfig, env } from '#/config';

import { LogClass } from '../logger/log-decorator';
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
export class MailService {
  public sender: EmailServiceSender;

  constructor(private provider: MailServiceProvider = 'smtp') {
    this.sender = this.provider === 'smtp' ? createTransporterSMTP(smtpConfig) : createTransporterSG(sendgridConfig);
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
