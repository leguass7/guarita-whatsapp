import type { CompletedEventCallback, FailedEventCallback, Job } from 'bull';
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
  constructor(
    private maxbotJob: SendQueueService,
    private sendLogService: SendLogService,
    private cacheService: CacheService,
  ) {}

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
    return async (
      { attemptsMade, failedReason: message = '', id }: Job,
      { response = '' }: any,
    ) => {
      //
      const created = await this.sendLogService.create({
        ...data,
        status: false,
        message,
        response,
        createdAt: new Date(),
        attemptsMade: attemptsMade || -1,
        jobId: id ? `${id}` : null,
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

    const log: LogCallback = _logId => {
      logging('Mensagem enviada', to, _logId);
    };

    const priority = this.getPriority(to);

    const job = (
      await this.maxbotJob.push(
        'SendMaxbotText',
        { token, to, text },
        { priority, removeOnComplete: true },
      )
    )
      .try()
      .failed()
      .success();
    // .onTryFailed('SendMaxbotText', this.processFailed({ ...save, eventType: 'trying' }))
    // .onFailed('SendMaxbotText', this.processFailed({ ...save, eventType: 'failed' }))
    // .onSuccess('SendMaxbotText', this.processSuccess(save, log))
    // .add('SendMaxbotText', { token, to, text }, { priority, removeOnComplete: true });

    // const job = await this.maxbotJob
    //   .onTryFailed('SendMaxbotText', this.processFailed({ ...save, eventType: 'trying' }))
    //   .onFailed('SendMaxbotText', this.processFailed({ ...save, eventType: 'failed' }))
    //   .onSuccess('SendMaxbotText', this.processSuccess(save, log))
    //   .add('SendMaxbotText', { token, to, text }, { priority, removeOnComplete: true });

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

    const log: LogCallback = _logId => {
      // logging('Imagem enviada', to, url, logId)
    };

    const priority = this.getPriority(to);

    const job = await this.maxbotJob
      .onTryFailed('SendMaxbotText', this.processFailed({ ...save, eventType: 'trying' }))
      .onFailed('SendMaxbotText', this.processFailed({ ...save, eventType: 'failed' }))
      .onSuccess('SendMaxbotText', this.processSuccess(save, log))
      .add('SendMaxbotText', { token, to, url }, { priority, removeOnComplete: true });

    return job;
  }
}
