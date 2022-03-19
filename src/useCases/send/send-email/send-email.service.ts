import { LogClass } from '#/services/logger/log-decorator';
import type { EmailSentService } from '#/useCases/email';

import type { SendEmailDto } from './send-email.dto';
import type { SendEmailQueueService } from './send-email.job';

@LogClass
export class SendEmailService {
  constructor(
    private emailSentService: EmailSentService,
    private sendEmailQueue: SendEmailQueueService,
  ) {}

  async sendGeneral(data: SendEmailDto) {
    const job = await this.sendEmailQueue
      .setWorker('sendGeneralEmailJob')
      .trying()
      .failed()
      .success()
      .save({ ...data, imageLogoURL: '', imageVendorURL: '', trackImageURL: '' });
    return { job };
  }
}
