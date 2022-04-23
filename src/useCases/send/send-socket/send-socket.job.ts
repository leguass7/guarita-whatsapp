import type { Job, JobOptions } from 'bull';

import { prefix } from '#/config';
import { logging } from '#/services/logger';
import type { IJob, QueueService, QueueOptions } from '#/services/QueueService';
import type { SocketService } from '#/services/SocketService';
import { SocketException } from '#/services/SocketService/socket-exception';

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
  //   backoff: { type: 'exponential', delay: 60 * 8 * 1000 }, // 8 minutos
  backoff: { type: 'exponential', delay: 1000 },
};

export const sendSocketQueueOptions: QueueOptions = {
  defaultJobOptions,
  prefix,
  limiter: { max: 1, duration: 1000 * 60 },
};

export function createSendSocketJob(socketService: SocketService): IJob<JobNames, SendSocketPayload> {
  return {
    name: 'SendSocketText',
    handle: async ({ data }) => {
      const { text, to } = data;
      const message = await socketService.sendText({ text, to });
      if (!message || !message?.success) {
        throw new SocketException(`SendSocketText error ${to}`, { ...message });
      }
      logging('SendSocketJob SUCCESS', to);
      return message;
    },
  };
}
