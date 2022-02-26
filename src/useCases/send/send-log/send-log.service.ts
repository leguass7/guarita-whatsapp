import { format } from 'date-fns';
import { FindConditions, FindManyOptions, getRepository, Like } from 'typeorm';

import { isDefined } from '#/helpers/validation';

import type { CreateSendLog } from './send-log.dto';
import { SendLog } from './send-log.entity';

export class SendLogService {
  async create(data: CreateSendLog) {
    const repository = getRepository(SendLog);
    const contactData = repository.create(data);
    const result = await repository.save(contactData);
    return result;
  }

  async findByDate(date: Date, status?: boolean) {
    const repository = getRepository(SendLog);
    const where: FindConditions<SendLog> = {
      createdAt: Like(`%${format(date, 'yyyy-MM-dd')}%`),
    };
    if (isDefined(status)) where.status = !!status;
    const result = await repository.find({ where });
    return result;
  }

  async find(filter: FindManyOptions<SendLog>) {
    const repository = getRepository(SendLog);
    const result = await repository.find(filter);
    return result;
  }
}
