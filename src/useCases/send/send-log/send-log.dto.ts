import type { EnventType, SendLog } from './send-log.entity';

export type CreateSendLog = Omit<SendLog, 'id'>;

export type FilterSendLogDto = {
  status?: boolean;
  eventType?: EnventType | EnventType[];
};
