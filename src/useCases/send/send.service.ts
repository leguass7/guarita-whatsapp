import type { CompletedEventCallback, FailedEventCallback, Job } from 'bull';
import type { ISendTextResult } from 'maxbotjs/dist';

import { CacheService } from '#/services/ChacheService';
import { logging } from '#/services/logger';
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
    return async ({ failedReason: message = '' }: Job, { response = '' }: any) => {
      // console.log('FALHADO', message);
      const created = await this.sendLogService.create({
        ...data,
        status: false,
        message,
        response,
        createdAt: new Date(),
      });
      if (log && typeof log === 'function') log(created.id);
      return created;
    };
  }

  private processSuccess(data: CreateSendLog, log?: LogCallback): CompletedEventCallback {
    return async (job: Job, { msgId, msg: message }: ISendTextResult) => {
      // console.log('COMPLETADO', await job.isDelayed(), job.data);
      const created = await this.sendLogService.create({
        ...data,
        status: true,
        message,
        messageId: msgId,
        createdAt: new Date(),
      });
      if (log && typeof log === 'function') log(created.id);

      return created;
    };
  }

  async sendMaxbotText(payload: SendMaxbotPayload) {
    const { token, to, text } = payload;

    const save = { provider: 'maxbot', type: 'text', to, payload };
    const log: LogCallback = _logId => {
      //logging('Mensagem enviada', to, logId)
    };

    const priority = this.getPriority(to);
    console.log('priority', priority);
    const job = await this.maxbotJob
      .onFailed('SendMaxbotText', this.processFailed(save))
      .onSuccess('SendMaxbotText', this.processSuccess(save, log))
      .add('SendMaxbotText', { token, to, text }, { priority, removeOnComplete: true });

    return job;
  }

  async sendMaxbotImage(payload: SendMaxbotPayload) {
    const { token, to, url } = payload;

    const save = { provider: 'maxbot', type: 'image', to, payload };
    const log: LogCallback = logId => logging('Imagem enviada', to, url, logId);

    const job = await this.maxbotJob
      .onFailed('SendMaxbotImage', this.processFailed(save))
      .onSuccess('SendMaxbotImage', this.processSuccess(save, log))
      .add('SendMaxbotImage', { token, to, url });

    return job;
  }
}
