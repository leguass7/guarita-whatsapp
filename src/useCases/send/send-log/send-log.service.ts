import { format } from 'date-fns';
import { FindConditions, FindManyOptions, getRepository, In, Like } from 'typeorm';

import { isDevMode } from '#/config';
import { makeArray } from '#/helpers/array';
import { isDefined } from '#/helpers/validation';
import { logError, logging } from '#/services/logger';

import type { SendLogPayloadBody, SendLogsQueue } from './job/send-log.job';
import type { CreateSendLog, FilterSendLogDto } from './send-log.dto';
import { SendLog } from './send-log.entity';

export class SendLogService {
  constructor(private sendLogsBodyQueue: SendLogsQueue) {}
  async create(data: CreateSendLog) {
    const repository = getRepository(SendLog);
    const contactData = repository.create(data);
    const result = await repository.save(contactData);
    return result;
  }

  async findByDate(date: Date, { status, eventType }: FilterSendLogDto = {}) {
    const repository = getRepository(SendLog);
    const where: FindConditions<SendLog> = {
      scheduled: Like(`%${format(date, 'yyyy-MM-dd')}%`),
      // eventType: In(['failed', 'success']),
    };

    if (isDefined(status)) where.status = !!status;
    if (isDefined(eventType)) where.eventType = In(makeArray(eventType));
    const result = await repository.find({ where, order: { scheduled: 'ASC', createdAt: 'ASC' } });
    return result;
  }

  async find(filter: FindManyOptions<SendLog>) {
    const repository = getRepository(SendLog);
    const result = await repository.find(filter);
    return result;
  }

  async findOne(where: FindConditions<SendLog>) {
    const repository = getRepository(SendLog);
    const result = await repository.findOne({ where });
    return result;
  }

  async sendBody(date: Date) {
    const logs = await this.findByDate(date);
    const failedList = logs.filter(f => f.eventType === 'failed');
    const tryingLength = logs.filter(f => f.eventType === 'trying')?.length;
    const successLength = logs.filter(f => f.eventType === 'success')?.length;
    const txtDate = format(date, 'dd/MM/yyyy');

    const subject = `Relat??rio dia ${txtDate}${isDevMode ? ' (TESTE)' : ''}`;

    const payload: SendLogPayloadBody = {
      date,
      failedList,
      tryingLength,
      successLength,
      subject,
    };

    const job = await this.sendLogsBodyQueue
      .setWorker('SendLogBody')
      .trying(({ failedReason, attemptsMade }) => logError('SendLogService TENTANDO:', attemptsMade, failedReason), true)
      .failed(({ failedReason }) => logError('SendLogService FALHOU:', failedReason), true)
      .success(() => logging('SendLogService ENVIADO SendLogBody:', subject), true)
      .save(payload, { removeOnComplete: true, removeOnFail: true });
    return job;
  }
}
