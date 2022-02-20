import { Job, JobOptions } from 'bull';

import { MaxbotException } from '#/app/exceptions/MaxbotException';
import type { IRegisterJob, JobService } from '#/services/JobService';
import { logDev } from '#/services/logger';
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
  delay: 1000,
  attempts: 2,
  timeout: queueTimetout - 1,
  backoff: { type: 'fixed', delay: 10000 },
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

    logDev('enviando imagem', url);
    const maxbot = new MaxbotService({ token, timeout: queueTimetout });
    const response = await maxbot.sendImage({ whatsapp: to }, url);
    logDev('response imagem', response);

    if (!Boolean(response?.status)) {
      throw new MaxbotException(response.msg, response);
    }

    return response as ISendTextResult;
  },
};
