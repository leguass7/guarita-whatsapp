import { IRequestClient } from './socket-server.dto';

export interface RequestStatusDto extends IRequestClient {
  waId?: string;
}
