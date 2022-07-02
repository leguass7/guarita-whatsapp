import { ISocketClientResponse } from './server-to-client/socket-server.dto';

export class SocketException extends TypeError {
  message: string;
  response?: ISocketClientResponse;
  constructor(message: string, response?: ISocketClientResponse) {
    super();
    this.message = message;
    this.response = response || null;
  }
}
