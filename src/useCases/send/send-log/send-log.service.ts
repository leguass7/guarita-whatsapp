import { getRepository } from 'typeorm';

import type { CreateSendLog } from './send-log.dto';
import { SendLog } from './send-log.entity';

export class SendLogService {
  async create(data: CreateSendLog) {
    const repository = getRepository(SendLog);
    const contactData = repository.create(data);
    const result = await repository.save(contactData);
    return result;
  }
}
