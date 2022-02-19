import { getRepository } from 'typeorm';

import { Contact } from './contact.entity';

export class ContactService {
  async create(data: Contact) {
    const repository = getRepository(Contact);
    const contactData = repository.create(data);
    const result = await repository.save(contactData);
    return result;
  }

  async update(contactId: number, data: any) {
    const repository = getRepository(Contact);
    const result = await repository.update(contactId, data);
    return result;
  }
}
