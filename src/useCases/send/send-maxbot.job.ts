import type { Job, JobOptions } from 'bull';

import { MaxbotService, ISendTextResult } from '#/services/MaxbotService/index.ts';
import { MaxbotException } from '#/services/MaxbotService/maxbot-exception';
import { QueueService, IJob } from '#/services/QueueService';
import { loggerService } from '#/useCases/logger.service';

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
  delay: 4050,
  attempts: 3,
  timeout: 30000,
  backoff: { type: 'exponential', delay: 60 * 8 * 1000 }, // 8 minutos
  // backoff: { type: 'exponential', delay: 1000 },
};

export const sendMaxbotMessage: IJob<JobNames, SendMaxbotPayload> = {
  name: 'SendMaxbotText',
  async handle({ data, attemptsMade }) {
    const { token, to, text } = data;

    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });

    const maxbot = new MaxbotService({ token, timeout: 10000 });

    if (attemptsMade > 1) {
      const isReady = await maxbot.getStatus();
      if (!isReady) {
        loggerService.logError(`SendMaxbotText is not ready ${to}`);
        throw new MaxbotException(`SendMaxbotText is not ready ${to}`, {
          getStatus: true,
          status: 0,
          msg: `Failure`,
        });
      }
    }

    const response = await maxbot.sendText({ whatsapp: to }, text);

    if (!Boolean(response?.status)) {
      loggerService.logError(`SendMaxbotText status ${JSON.stringify(response)}`);
      throw new MaxbotException(response.msg, response);
    }

    return response as ISendTextResult;
  },
};

export const sendMaxbotImage: IJob<JobNames, SendMaxbotPayload> = {
  name: 'SendMaxbotImage',
  async handle({ data }) {
    const { token, to, url } = data;

    //throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
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
