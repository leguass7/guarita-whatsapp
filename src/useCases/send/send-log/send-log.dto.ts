import { SendLog } from './send-log.entity';

export type CreateSendLog = Omit<SendLog, 'id'>;
