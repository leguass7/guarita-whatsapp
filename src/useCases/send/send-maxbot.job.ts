import type { Job, JobOptions } from 'bull';
// import { format } from 'date-fns';

import { MaxbotException } from '#/app/exceptions/MaxbotException';
// import { nodeEnv } from '#/config';
import { MaxbotService, ISendTextResult } from '#/services/maxbot.service';
import { QueueService, IJob } from '#/services/QueueService';

export type SendMaxbotPayload = {
  token: string;
  to: string;
  text?: string;
  url?: string;
};

export type JobNames = 'SendMaxbotText' | 'SendMaxbotImage';

export type SendQueueService = QueueService<JobNames, SendMaxbotPayload>;

export interface QueuePayload extends Job {
  data: SendMaxbotPayload;
}

// const testing = !!(nodeEnv === 'testing');

export const defaultJobOptions: JobOptions = {
  delay: 100,
  attempts: 3,
  timeout: 24000,
  backoff: { type: 'exponential', delay: 120000 },
};

// if (!testing) {
//   defaultJobOptions.delay = 100;
//   defaultJobOptions.attempts = 3;
//   defaultJobOptions.backoff = { type: 'exponential', delay: 120000 };
// }

export const sendMaxbotMessage: IJob<JobNames, SendMaxbotPayload> = {
  name: 'SendMaxbotText',
  async handle({ data }) {
    const { token, to, text } = data;

    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
    // return { status: 1, msg: 'test' };

    const maxbot = new MaxbotService({ token, timeout: 5000 });
    const isReady = await maxbot.getStatus();

    if (!isReady) {
      throw new MaxbotException(`SendMaxbotText is not ready ${to}`, {
        getStatus: true,
        status: 0,
        msg: `Failure`,
      });
    }

    const response = await maxbot.sendText({ whatsapp: to }, text);

    if (!Boolean(response?.status)) {
      throw new MaxbotException(response.msg, response);
    }

    return response as ISendTextResult;
  },
};

export const sendMaxbotImage: IJob<JobNames, SendMaxbotPayload> = {
  name: 'SendMaxbotImage',
  async handle({ data }) {
    const { token, to, url } = data;

    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
    // return { status: 1, msg: 'test' };

    const maxbot = new MaxbotService({ token, timeout: 5000 });
    const isReady = await maxbot.getStatus();
    if (!isReady) {
      throw new MaxbotException(`SendMaxbotImage is not ready ${to}`, {
        status: 0,
        msg: `Failure`,
      });
    }

    const response = await maxbot.sendImage({ whatsapp: to }, url);

    if (!Boolean(response?.status)) {
      throw new MaxbotException(response.msg, response);
    }

    return response as ISendTextResult;
  },
};
