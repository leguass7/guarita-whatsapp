import type { ISocketClientResponse } from '.';

export class SocketException extends TypeError {
  message: string;
  response?: ISocketClientResponse;
  constructor(message: string, response?: ISocketClientResponse) {
    super();
    this.message = message;
    this.response = response || null;
  }
}
