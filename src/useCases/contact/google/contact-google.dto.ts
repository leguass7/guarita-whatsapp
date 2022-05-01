import type { IGoogleContact } from '#/services/GoogleService';

export interface PaginatedGoogleContactDto {
  total: number;
  size: number;
  page: number;
  data: IGoogleContact[];
}
