import type { CompletedEventCallback, Job } from 'bull';
import { createHash } from 'crypto';
import { format } from 'date-fns';
import type { ISendTextResult } from 'maxbotjs/dist';

import type { CacheService } from '#/services/CacheService/cache.service';
import { LogClass } from '#/services/LoggerService/log-class.decorator';
import type { FailedPromiseCallback } from '#/services/QueueService';
import { loggerService } from '#/useCases/logger.service';

import type { SendEmailService } from './send-email/send-email.service';
import type { CreateSendLog } from './send-log/send-log.dto';
import type { SendLogService } from './send-log/send-log.service';
import type { SendMaxbotPayload, SendQueueService } from './send-maxbot.job';
import type { MessageMetadata } from './send.dto';

type LogCallback = (logId?: string | number) => void;

export type SendServiceJobScheluer = (payload: SendMaxbotPayload) => Promise<Job<any>>;

@LogClass
export class SendService {
  constructor(
    private maxbotJob: SendQueueService,
    private sendLogService: SendLogService,
    private cacheService: CacheService,
    private sendEmailService: SendEmailService,
  ) {}

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

    // FIXME: Prioridade fixa para resolver problema de síndicos com múltiplos condomínios
    // Todos os envios terão a mesma prioridade, garantindo processamento FIFO
    return 1;
  }

  private processFailed(data: CreateSendLog, log?: LogCallback): FailedPromiseCallback<SendMaxbotPayload, string> {
    return async ({ attemptsMade: attempt, failedReason: message = '', id }: Job, { response = '' }: any) => {
      const jobId = id ? `${id}` : null;
      const attemptsMade = attempt || -1;
      const { eventType } = data;

      const has = await this.sendLogService.findOne({ jobId, attemptsMade, eventType });
      if (has) return null;

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
      loggerService.logError(`SendService processFailed type=${eventType} to=${data.to} ${message} created:${created?.id}`);
      return created?.id;
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

  async sendMaxbotText(payload: SendMaxbotPayload, { email, forbiddenEmail, makeType }: MessageMetadata = {}) {
    const { token, to, text } = payload;

    const save: CreateSendLog = {
      provider: 'maxbot',
      type: 'text',
      to,
      payload,
      scheduled: new Date(),
      eventType: 'success',
    };

    const log: LogCallback = logId => loggerService.logging('Mensagem enviada', to, logId);

    const key = this.getCacheKey(to, text);
    const priority = this.getPriority(key);

    const job = await this.maxbotJob
      .setWorker('SendMaxbotText')
      .trying(this.processFailed({ ...save, eventType: 'trying' }), true)
      .failed((job, response) => {
        this.processFailed({ ...save, eventType: 'failed' })(job, response).then(sendLogId => {
          if (email && !forbiddenEmail) {
            const date = format(new Date(), 'dd/MM/yyyy');
            // console.log('makeType', makeType, !!forbiddenEmail, email, sendLogId);
            this.sendEmailService.sendContingency({ email, subject: `Relatório ${date}`, text, makeType, jobId: job?.id, sendLogId, date });
          }
        });
      }, true)
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

    const log: LogCallback = logId => loggerService.logging('Imagem enviada', to, url, logId);

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
