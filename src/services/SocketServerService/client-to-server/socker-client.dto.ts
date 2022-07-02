import type { ISocketClientResponse } from '../server-to-client/socket-server.dto';
import type { RequestCountDeviceDto } from './count-device.dto';

export interface RequestStatusDto {
  uid: string;
}

export type ClientToServerCallback = (response?: ISocketClientResponse) => Promise<any>;

export interface ClientToServerEvents {
  status: (req: RequestStatusDto, callback?: ClientToServerCallback) => void;
  'count-device': (req: RequestCountDeviceDto, callback?: ClientToServerCallback) => void;
}
