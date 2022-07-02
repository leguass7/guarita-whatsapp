import type { RequestSendTextDto } from './send-text.dto';
import type { RequestStatusDto } from './status.dto';

export interface IRequestClient {
  uid?: string;
}

export type ISocketClientResponse<T = Record<string, any>> = T & {
  success: boolean;
  message: string;
};

export type ServerToClientCallback = (response: ISocketClientResponse) => Promise<any> | void;

export interface ServerToClientEvents {
  status: (data: RequestStatusDto, callback?: ServerToClientCallback) => void;
  'send-text': (data: RequestSendTextDto, callback?: ServerToClientCallback) => void;
}
