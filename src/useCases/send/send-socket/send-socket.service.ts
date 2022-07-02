import type { Job } from 'bull';

import { HttpException } from '#/app/exceptions/HttpException';
import type { CacheService } from '#/services/ChacheService';
import { LogClass } from '#/services/LoggerService/log-class.decorator';
import type { SocketServerService } from '#/services/SocketServerService';
import { loggerService } from '#/useCases/logger.service';

import type { CreateSendLog } from '../send-log/send-log.dto';
import type { EnventType } from '../send-log/send-log.entity';
import type { SendLogService } from '../send-log/send-log.service';
import type { RequestSendSocketTextDto } from './send-socket.dto';
import type { SendSocketQueueService } from './send-socket.job';

@LogClass
export class SendSocketService {
  constructor(
    private socketServerService: SocketServerService,
    private sendSocketQueue: SendSocketQueueService,
    private cacheService: CacheService,
    private sendLogService: SendLogService,
  ) {}

  private processLog({ eventType, ...data }: CreateSendLog) {
    const saveData = async (toSave: CreateSendLog) => {
      const created = await this.sendLogService.create({ ...toSave, createdAt: new Date() });
      return created?.id;
    };

    const failed = async ({ attemptsMade: attempt, failedReason: message = '', id }: Job, { response = '' }: any) => {
      const jobId = id ? `${id}` : null;
      const attemptsMade = attempt || -1;
      const has = await this.sendLogService.findOne({ jobId, attemptsMade, eventType });
      if (has) return null;
      const createdId = await saveData({ ...data, eventType, response, createdAt: new Date(), jobId, message });
      loggerService.logError(`SendSocketService processFailed type=${eventType} to=${data.to} ${message} created:${createdId}`);
      return createdId;
    };

    const success = async ({ attemptsMade: attempt, id }: Job, response: any) => {
      const { messageId, message } = response;
      const jobId = id ? `${id}` : null;
      const attemptsMade = attempt || 0;
      const createdId = await saveData({ ...data, eventType, createdAt: new Date(), jobId, message, messageId, attemptsMade });
      return createdId;
    };

    return eventType === 'success' ? success : failed;
  }

  async sendScheduledText(data: RequestSendSocketTextDto) {
    const process = (eventType: EnventType) => {
      const save: CreateSendLog = {
        provider: 'socket',
        status: !!(eventType === 'success'),
        eventType,
        type: 'text',
        to: data.to,
        payload: data,
        scheduled: new Date(),
      };
      return this.processLog(save);
    };

    const priority = this.cacheService.generatePriority(data.to, data.text);
    const job = await this.sendSocketQueue
      .setWorker('SendSocketText')
      .trying(process('trying'))
      .failed(process('failed'))
      .success(process('success'))
      .save({ ...data }, { priority, removeOnComplete: true });

    return { jobId: job?.id };
  }

  async sendText(data: RequestSendSocketTextDto) {
    const response = await this.socketServerService.sendText(data);
    if (!response?.success) {
      throw new HttpException(503, `service_unavailable`);
    }
    loggerService.logging('SendSocketService sendText:', data?.to, response?.messageId);
    return response;
  }

  async getStatus() {
    const response = await this.socketServerService.getStatus();
    loggerService.logging('SendSocketService getStatus:', response?.message);
    return response;
  }
}
