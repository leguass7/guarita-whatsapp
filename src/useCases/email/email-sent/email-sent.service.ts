import type { DeepPartial } from 'typeorm';

import type { DataSourceService } from '#/services/DataSourceService';
import { LogClass } from '#/services/LoggerService/log-class.decorator';

import { EmailSent } from './email-sent.entity';

@LogClass
export class EmailSentService {
  constructor(private readonly dataSource: DataSourceService) {}
  async create(data: DeepPartial<EmailSent>) {
    const repository = this.dataSource.getRepository(EmailSent);
    const emailSent = repository.create(data);
    const created = await repository.save(emailSent);
    return created;
  }

  async increment(imageId: string) {
    const repository = this.dataSource.getRepository(EmailSent);
    const updated = await repository
      .createQueryBuilder('EmailSent')
      .update(EmailSent)
      .whereInIds(imageId)
      .set({ countRead: () => 'countRead + 1' })
      .execute();
    return !!(updated && !!updated?.affected);
  }

  async update(imageId: string, data: DeepPartial<EmailSent>) {
    const repository = this.dataSource.getRepository(EmailSent);
    const result = await repository.update(imageId, data);
    return result;
  }
}
