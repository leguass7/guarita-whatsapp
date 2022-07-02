import type { Job, JobOptions } from 'bull';

import { prefix } from '#/config';
import type { IJob, QueueService, QueueOptions } from '#/services/QueueService';
import type { SocketServerService } from '#/services/SocketServerService';
import { SocketException } from '#/services/SocketServerService/socket-exception';
import { loggerService } from '#/useCases/logger.service';

export type SendSocketPayload = {
  to: string;
  text: string;
};

export type JobNames = 'SendSocketText' | 'SendSocketImage';

export type SendSocketQueueService = QueueService<JobNames, SendSocketPayload>;

export interface QueuePayload extends Job {
  data: SendSocketPayload;
}

const defaultJobOptions: JobOptions = {
  delay: 100,
  attempts: 2,
  timeout: 30000,
  backoff: { type: 'exponential', delay: 1000 * 30 }, // tenta novamente depois de 30s
};

export const sendSocketQueueOptions: QueueOptions = {
  defaultJobOptions,
  prefix,
  limiter: { max: 1, duration: 1000 * 36 },
};

export function createSendSocketJob(socketServerService: SocketServerService): IJob<JobNames, SendSocketPayload> {
  return {
    name: 'SendSocketText',
    handle: async ({ data }) => {
      const { text, to } = data;
      const message = await socketServerService.sendText({ text, to });
      if (!message || !message?.success) {
        throw new SocketException(`SendSocketText error ${to}`, { ...message });
      }
      loggerService.logging('SendSocketJob SUCCESS', to);
      return message;
    },
  };
}
