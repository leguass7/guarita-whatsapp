import type { Job } from 'bull';

import { baseEmailAssets } from '#/config';
import type { LoggerService } from '#/services/LoggerService';
import { LogClass } from '#/services/LoggerService/log-class.decorator';
import { setImageNameDto } from '#/useCases/email/email-assets.util';
import type { EmailSentService } from '#/useCases/email/email-sent/email-sent.service';

import { CreateSendLog } from '../send-log/send-log.dto';
import { SendLogService } from '../send-log/send-log.service';
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

type EnventType = 'trying' | 'failed' | 'success';

@LogClass
export class SendEmailService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly emailSentService: EmailSentService,
    private readonly sendEmailQueue: SendEmailQueueService,
    private readonly sendEmailHbs: SendEmailHbs,
    private readonly sendLogService: SendLogService,
  ) {}

  processLog({ eventType, ...data }: CreateSendLog) {
    const saveData = async (toSave: CreateSendLog) => {
      const created = await this.sendLogService.create({ ...toSave, createdAt: new Date() });
      return created?.id;
    };

    const success = async ({ attemptsMade: attempt, id }: Job, response: any) => {
      const { method, messageId } = response;
      const jobId = id ? `${id}` : null;
      const attemptsMade = attempt || 0;
      this.loggerService.logging(
        `SendEmailService process`,
        `type=${eventType} to=${data?.to}`,
        `jobId:${jobId} attempts=${attemptsMade}`,
        `method=${method}`,
        `messageId=${messageId}`,
      );
      const createdId = await saveData({ ...data, eventType, jobId, messageId, attemptsMade });
      return createdId;
    };

    const failed = async ({ attemptsMade: attempt, failedReason: message = '', id }: Job, { response = '' }: any) => {
      const jobId = id ? `${id}` : null;
      const attemptsMade = attempt || -1;
      this.loggerService.logError(
        `SendEmailService processFailed`,
        `type=${eventType} to=${data?.to}`,
        `${message} jobId:${jobId} attempts=${attemptsMade}`,
      );
      const has = await this.sendLogService.findOne({ jobId, attemptsMade, eventType });
      if (has) return null;
      const createdId = await saveData({ ...data, eventType, response, jobId, message });
      return createdId;
    };

    if (eventType === 'success') return success;
    return failed;
  }

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
    const process = (eventType: EnventType) => {
      const save: CreateSendLog = {
        provider: 'email',
        status: !!(eventType === 'success'),
        eventType,
        type: 'text',
        to: data.email,
        payload: data,
        scheduled: new Date(),
      };
      return this.processLog(save);
    };

    const job = await this.sendEmailQueue
      .setWorker('sendGeneralEmailJob')
      .trying(process('trying'), true)
      .failed(process('failed'), true)
      .success(process('success'), true)
      .save({ ...data });
    return { job };
  }

  async sendGeneralSg(data: SendEmailDto) {
    const process = (eventType: EnventType) => {
      const save: CreateSendLog = {
        provider: 'email',
        status: !!(eventType === 'success'),
        eventType,
        type: 'text',
        to: data.email,
        payload: data,
        scheduled: new Date(),
      };
      return this.processLog(save);
    };

    const job = await this.sendEmailQueue
      .setWorker('SendGeneralEmailJobSg')
      .trying(process('trying'), true)
      .failed(process('failed'), true)
      .success(process('success'), true)
      .save({ ...data });
    return { job };
  }

  async sendContingency({ email, subject, text, makeType, jobId, sendLogId, date }: SendEmailDto & ContingencyData & Partial<ContingencyContext>) {
    const trackers = await this.getTrackerImages({ makeType, jobId, sendLogId });
    const html = await this.sendEmailHbs.templateContigency({ ...trackers, date, text });

    const job = await this.sendEmailQueue
      .setWorker('SendHtmlEmailJob')
      .trying(() => null, true)
      .failed(() => null, true)
      .success(() => this.loggerService.logging(`CONTINGENCY EMAIL: ${jobId} ${email}`), true)
      .save<SendContingencyEmailPayload>({ email, subject, html });
    return { job };
  }
}
