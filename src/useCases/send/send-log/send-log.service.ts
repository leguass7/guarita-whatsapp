import { format } from 'date-fns';
import { FindManyOptions, In, Like, FindOptionsWhere } from 'typeorm';

import { isDevMode } from '#/config';
import { makeArray } from '#/helpers/array';
import { isDefined } from '#/helpers/validation';
import type { DataSourceService } from '#/services/DataSourceService';
import type { LoggerService } from '#/services/LoggerService';
import { LogClass } from '#/services/LoggerService/log-class.decorator';

import type { SendLogPayloadBody, SendLogsQueue } from './job/send-log.job';
import type { CreateSendLog, FilterSendLogDto } from './send-log.dto';
import { SendLog } from './send-log.entity';

@LogClass
export class SendLogService {
  constructor(
    private readonly dataSource: DataSourceService,
    private readonly sendLogsBodyQueue: SendLogsQueue,
    private readonly loggerService: LoggerService,
  ) {}
  async create(data: CreateSendLog) {
    const repository = this.dataSource.getRepository(SendLog);
    const contactData = repository.create(data);
    const result = await repository.save(contactData);
    return result;
  }

  async findByDate(date: Date, { status, eventType }: FilterSendLogDto = {}) {
    const repository = this.dataSource.getRepository(SendLog);
    const where: FindOptionsWhere<SendLog> = {
      // @ts-ignore
      scheduled: Like(`%${format(date, 'yyyy-MM-dd')}%`),
      // eventType: In(['failed', 'success']),
    };

    if (isDefined(status)) where.status = !!status;
    if (isDefined(eventType)) where.eventType = In(makeArray(eventType));
    const result = await repository.find({ where, order: { scheduled: 'ASC', createdAt: 'ASC' } });
    return result;
  }

  async find(filter: FindManyOptions<SendLog>) {
    const repository = this.dataSource.getRepository(SendLog);
    const result = await repository.find(filter);
    return result;
  }

  async findOne(where: FindOptionsWhere<SendLog>) {
    const repository = this.dataSource.getRepository(SendLog);
    const result = await repository.findOne({ where });
    return result;
  }

  async sendBody(date: Date) {
    const logs = await this.findByDate(date);
    const failedList = logs.filter(f => f.eventType === 'failed');
    const tryingLength = logs.filter(f => f.eventType === 'trying')?.length;
    const successLength = logs.filter(f => f.eventType === 'success')?.length;
    const txtDate = format(date, 'dd/MM/yyyy');

    const subject = `Relatório dia ${txtDate}${isDevMode ? ' (TESTE)' : ''}`;

    const payload: SendLogPayloadBody = {
      date,
      failedList,
      tryingLength,
      successLength,
      subject,
    };

    const job = await this.sendLogsBodyQueue
      .setWorker('SendLogBody')
      .trying(({ failedReason, attemptsMade }) => this.loggerService.logError('SendLogService TENTANDO:', attemptsMade, failedReason), true)
      .failed(({ failedReason }) => this.loggerService.logError('SendLogService FALHOU:', failedReason), true)
      .success(() => this.loggerService.logging('SendLogService ENVIADO SendLogBody:', subject), true)
      .save(payload, { removeOnComplete: true, removeOnFail: true });
    return job;
  }
}
