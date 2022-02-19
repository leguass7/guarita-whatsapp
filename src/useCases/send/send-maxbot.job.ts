import { Job, JobOptions } from 'bull';
import Maxbot from 'maxbotjs';

import { MaxbotException } from '#/app/exceptions/MaxbotException';
import type { IRegisterJob, JobService } from '#/services/JobService';

export type SendMaxbotPayload = {
  token: string;
  to: string;
  text: string;
};

export type JobKeys = 'SendMaxbot';

export type SendJobService = JobService<JobKeys, SendMaxbotPayload>;

export interface QueuePayload extends Job {
  data: SendMaxbotPayload;
}

export const defaultJobOptions: JobOptions = {
  delay: 1000,
  attempts: 2,
  backoff: { type: 'fixed', delay: 60000 },
};

export const sendMaxbotMessage: IRegisterJob = {
  key: 'SendMaxbot',
  async handle({ data }: QueuePayload) {
    const { token, to, text } = data;

    const maxbot = new Maxbot({ token, timeout: 10000 });
    const response = await maxbot.sendText({ whatsapp: to }, text);

    if (!Boolean(response?.status)) {
      throw new MaxbotException(response.msg, response);
    }

    return response;
  },
};
