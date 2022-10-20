import type { DataSourceService } from '#/services/DataSourceService';

import { Contact } from './contact.entity';

export class ContactService {
  constructor(private readonly dataSource: DataSourceService) {}

  async create(data: Contact) {
    const repository = this.dataSource.getRepository(Contact);
    const contactData = repository.create(data);
    const result = await repository.save(contactData);
    return result;
  }

  async update(contactId: number, data: any) {
    const repository = this.dataSource.getRepository(Contact);
    const result = await repository.update(contactId, data);
    return result;
  }
}
