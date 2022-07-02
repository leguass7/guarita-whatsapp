import { IRequestClient } from './socket-server.dto';

export interface RequestSendTextDto extends IRequestClient {
  to: string;
  text: string;
}
