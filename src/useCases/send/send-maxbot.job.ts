import type { Job, JobOptions } from 'bull';

import { MaxbotException } from '#/app/exceptions/MaxbotException';
import type { IRegisterJob, JobService } from '#/services/JobService';
import { MaxbotService, ISendTextResult } from '#/services/maxbot.service';

export type SendMaxbotPayload = {
  token: string;
  to: string;
  text?: string;
  url?: string;
};

export type JobKeys = 'SendMaxbotText' | 'SendMaxbotImage';

export type SendJobService = JobService<JobKeys, SendMaxbotPayload>;

export interface QueuePayload extends Job {
  data: SendMaxbotPayload;
}

const queueTimetout = 20000;
export const defaultJobOptions: JobOptions = {
  delay: 10,
  attempts: 3,
  timeout: queueTimetout - 1,
  backoff: { type: 'exponential', delay: 60000 },
};

export const sendMaxbotMessage: IRegisterJob<'SendMaxbotText'> = {
  key: 'SendMaxbotText',
  async handle({ data }: QueuePayload) {
    const { token, to, text } = data;

    const maxbot = new MaxbotService({ token, timeout: queueTimetout });
    const response = await maxbot.sendText({ whatsapp: to }, text);

    if (!Boolean(response?.status)) {
      throw new MaxbotException(response.msg, response);
    }

    return response as ISendTextResult;
  },
};

export const sendMaxbotImage: IRegisterJob<'SendMaxbotImage'> = {
  key: 'SendMaxbotImage',
  async handle({ data }: QueuePayload) {
    const { token, to, url } = data;

    const maxbot = new MaxbotService({ token, timeout: queueTimetout });
    const response = await maxbot.sendImage({ whatsapp: to }, url);

    if (!Boolean(response?.status)) {
      throw new MaxbotException(response.msg, response);
    }

    return response as ISendTextResult;
  },
};
