import type { GoogleService } from '#/services/google.service';

import type { PaginatedGoogleContactDto } from './contact-google.dto';

export class ContactGoogleService {
  constructor(private googleService: GoogleService) {}

  async paginateContacts(): Promise<PaginatedGoogleContactDto> {
    return null;
  }

  async syncContacts() {
    return this.googleService.allContacts(1000);
  }
}
