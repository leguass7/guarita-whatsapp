import type { Job, JobOptions } from 'bull';

import { MaxbotException } from '#/app/exceptions/MaxbotException';
import { logError } from '#/services/logger';
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
  backoff: { type: 'exponential', delay: 60 * 8 * 1000 }, // 8 minutos
};

export const sendMaxbotMessage: IJob<JobNames, SendMaxbotPayload> = {
  name: 'SendMaxbotText',
  async handle({ data, attemptsMade }) {
    const { token, to, text } = data;

    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
    // return { status: 1, msg: 'test' };

    const maxbot = new MaxbotService({ token, timeout: 10000 });
    const isReady = await maxbot.getStatus();

    if (!isReady && attemptsMade > 1) {
      logError(`SendMaxbotText is not ready ${to}`);
      throw new MaxbotException(`SendMaxbotText is not ready ${to}`, {
        getStatus: true,
        status: 0,
        msg: `Failure`,
      });
    }

    const response = await maxbot.sendText({ whatsapp: to }, text);

    if (!Boolean(response?.status)) {
      logError(`SendMaxbotText status ${JSON.stringify(response)}`);
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

    const maxbot = new MaxbotService({ token, timeout: 10000 });
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
