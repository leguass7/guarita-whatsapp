import { baseEmailAssets } from '#/config';
import { logging } from '#/services/logger';
import { LogClass } from '#/services/logger/log-decorator';
import type { EmailSentService } from '#/useCases/email';
import { setImageNameDto } from '#/useCases/email/email-assets.util';

import type { SendEmailDto } from './send-email.dto';
import type { ContingencyContext, SendEmailHbs, TemplateTrackers } from './send-email.hbs';
import type { SendContingencyEmailPayload, SendEmailQueueService } from './send-email.job';

// const makeupfail = 'https://avatarsolucoesdigitais.com.br/images/makeupfail.jpg';
// const makeupok = 'https://avatarsolucoesdigitais.com.br/images/makeupok.jpg';

const image = {
  fail: 'makeupfail.jpg',
  ok: 'makeupok.jpg',
};

type MakeType = keyof typeof image;
type ContingencyData = {
  makeType?: MakeType;
  jobId?: number | string;
  sendLogId?: string;
};

@LogClass
export class SendEmailService {
  constructor(private emailSentService: EmailSentService, private sendEmailQueue: SendEmailQueueService, private sendEmailHbs: SendEmailHbs) {}

  async getTrackerImages({ makeType, jobId, sendLogId }: ContingencyData = {}): Promise<TemplateTrackers> {
    const { url } = baseEmailAssets;
    const trackers: TemplateTrackers = {
      imageLogoURL: `${url}/logo-des.png`,
      imageVendorURL: `${url}/logo-avatar-pb.png`,
      trackImageURL: `${url}/${image[makeType] || 'robo.png'}`,
    };

    const emailSent = await this.emailSentService.create({ jobId: `${jobId}`, sendLogId });
    if (emailSent && emailSent?.id) {
      trackers.trackImageURL = `${url}/${setImageNameDto(image[makeType] || 'robo.png', emailSent.id)}`;
    }

    return trackers;
  }

  async sendGeneral(data: SendEmailDto) {
    const job = await this.sendEmailQueue
      .setWorker('sendGeneralEmailJob')
      .trying()
      .failed()
      .success()
      .save({ ...data });
    return { job };
  }

  async sendContingency({ email, subject, text, makeType, jobId, sendLogId, date }: SendEmailDto & ContingencyData & Partial<ContingencyContext>) {
    const trackers = await this.getTrackerImages({ makeType, jobId, sendLogId });
    const html = await this.sendEmailHbs.templateContigency({ ...trackers, date, text });

    const job = await this.sendEmailQueue
      .setWorker('SendHtmlEmailJob')
      .success(() => logging(`CONTINGENCY EMAIL: ${jobId} ${email}`), true)
      .save<SendContingencyEmailPayload>({ email, subject, html });
    return { job };
  }
}
