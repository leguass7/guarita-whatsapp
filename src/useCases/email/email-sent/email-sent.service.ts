import { DeepPartial, getRepository } from 'typeorm';

import { LogClass } from '#/services/LoggerService/log-class.decorator';

import { EmailSent } from './email-sent.entity';

@LogClass
export class EmailSentService {
  async create(data: DeepPartial<EmailSent>) {
    const repository = getRepository(EmailSent);
    const emailSent = repository.create(data);
    const created = await repository.save(emailSent);
    return created;
  }

  async increment(imageId: string) {
    const repository = getRepository(EmailSent);
    const updated = await repository
      .createQueryBuilder('EmailSent')
      .update(EmailSent)
      .whereInIds(imageId)
      .set({ countRead: () => 'countRead + 1' })
      .execute();
    return !!(updated && !!updated?.affected);
  }

  async update(imageId: string, data: DeepPartial<EmailSent>) {
    const repository = getRepository(EmailSent);
    const result = await repository.update(imageId, data);
    return result;
  }
}
