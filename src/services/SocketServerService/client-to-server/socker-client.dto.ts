import type { ISocketClientResponse } from '../server-to-client/socket-server.dto';
import type { RequestCountDeviceDto } from './count-device.dto';
import { RequestStatusDto, ResponseStatusDto } from './status.dto';

export type ClientToServerCallback<T> = (response?: ISocketClientResponse<T>) => Promise<any>;
export type ClientToServerHandler<Req = any, Res = any> = (req: Req, callback?: ClientToServerCallback<Res>) => Promise<void> | void;

export interface ClientToServerEvents {
  status: ClientToServerHandler<RequestStatusDto, ResponseStatusDto>;
  'device/count': ClientToServerHandler<RequestCountDeviceDto>;
}
