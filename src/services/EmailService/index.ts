import { smtpConfig, sendgridConfig, env } from '#/config';

// import { logDev } from '../LoggerService';
import { EmailServiceSender, SendPayloadDto } from './send.dto';
import { createTransporterSG } from './sendgrid.provider';
import { createTransporterSMTP } from './smtp.provider';

export type { SendPayloadDto };

export type MailServiceProvider = 'smtp' | 'sendgrid';

export class MailService {
  public sender: EmailServiceSender;
  constructor(private provider: MailServiceProvider = 'smtp') {
    this.sender =
      this.provider === 'smtp'
        ? createTransporterSMTP(smtpConfig)
        : createTransporterSG(sendgridConfig);
    return this;
  }

  async send(payload: SendPayloadDto) {
    const from = payload?.from || env.MAIL_FROM || smtpConfig?.auth?.user;
    if (!from) throw new Error('invalid_mail_from');
    const response = await this.sender({ from, ...payload });
    return response;
  }
}
