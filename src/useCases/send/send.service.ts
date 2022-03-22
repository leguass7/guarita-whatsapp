import type { CompletedEventCallback, FailedEventCallback, Job } from 'bull';
import { createHash } from 'crypto';
import type { ISendTextResult } from 'maxbotjs/dist';

import { CacheService } from '#/services/ChacheService';
import { logError, logging } from '#/services/logger';
import { LogClass } from '#/services/logger/log-decorator';

import { CreateSendLog } from './send-log/send-log.dto';
import { SendLogService } from './send-log/send-log.service';
import { SendMaxbotPayload, SendQueueService } from './send-maxbot.job';

type LogCallback = (logId?: string | number) => void;

export type SendServiceJobScheluer = (payload: SendMaxbotPayload) => Promise<Job<any>>;

@LogClass
export class SendService {
  constructor(private maxbotJob: SendQueueService, private sendLogService: SendLogService, private cacheService: CacheService) {}

  private getCacheKey(to: string, data: string): string {
    const payload = `${to}-${data}`;
    const hash = createHash('md5').update(payload).digest('hex');
    return `${to}-${hash}`;
  }

  public getPriority(to: string) {
    const key = `to-${to}`;
    let count = 1;
    const has = this.cacheService.hasKey(key);
    if (has) {
      count = Number(this.cacheService.get<number>(key)) + 1;
    }
    this.cacheService.set(key, count, 6200);
    return count;
  }

  private processFailed(data: CreateSendLog, log?: LogCallback): FailedEventCallback {
    return async ({ attemptsMade: attempt, failedReason: message = '', id }: Job, { response = '' }: any) => {
      const jobId = id ? `${id}` : null;
      const attemptsMade = attempt || -1;
      const { eventType } = data;

      const has = await this.sendLogService.findOne({ jobId, attemptsMade, eventType });
      if (has) return has;

      const created = await this.sendLogService.create({
        ...data,
        status: false,
        message,
        response,
        createdAt: new Date(),
        attemptsMade: attemptsMade || -1,
        jobId,
      });
      if (log && typeof log === 'function') log(created.id);
      logError(`SendService processFailed type=${data?.eventType} to=${data.to} ${message}`);
      return created;
    };
  }

  private processSuccess(data: CreateSendLog, log?: LogCallback): CompletedEventCallback {
    return async ({ attemptsMade, id }: Job, { msgId, msg: message }: ISendTextResult) => {
      //
      const created = await this.sendLogService.create({
        ...data,
        status: true,
        message,
        messageId: msgId,
        createdAt: new Date(),
        attemptsMade: attemptsMade || 0,
        jobId: id ? `${id}` : null,
      });
      if (log && typeof log === 'function') log(created.id);

      return created;
    };
  }

  async sendMaxbotText(payload: SendMaxbotPayload) {
    const { token, to, text } = payload;

    const save: CreateSendLog = {
      provider: 'maxbot',
      type: 'text',
      to,
      payload,
      scheduled: new Date(),
      eventType: 'success',
    };

    const log: LogCallback = logId => logging('Mensagem enviada', to, logId);

    const key = this.getCacheKey(to, text);
    const priority = this.getPriority(key);

    const job = await this.maxbotJob
      .setWorker('SendMaxbotText')
      .trying(this.processFailed({ ...save, eventType: 'trying' }), true)
      .failed(this.processFailed({ ...save, eventType: 'failed' }), true)
      .success(this.processSuccess(save, log), true)
      .save({ token, to, text }, { priority, removeOnComplete: true });
    return job;
  }

  async sendMaxbotImage(payload: SendMaxbotPayload) {
    const { token, to, url } = payload;

    const save: CreateSendLog = {
      provider: 'maxbot',
      type: 'image',
      eventType: 'success',
      to,
      payload,
      scheduled: new Date(),
    };

    const log: LogCallback = logId => logging('Imagem enviada', to, url, logId);

    const key = this.getCacheKey(to, url);
    const priority = this.getPriority(key);

    const job = await this.maxbotJob
      .setWorker('SendMaxbotText')
      .trying(this.processFailed({ ...save, eventType: 'trying' }))
      .failed(this.processFailed({ ...save, eventType: 'failed' }), true)
      .success(this.processSuccess(save, log), true)
      .save({ token, to, url }, { priority, removeOnComplete: true });
    return job;
  }
}
