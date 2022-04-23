import http from 'http';
import { verify } from 'jsonwebtoken';
import { Server as ServerIo, Socket } from 'socket.io';
import { v4 as uuidV4 } from 'uuid';

import { jwtConfig } from '#/config';
import { logError, logging } from '#/services/logger';
import type { IPayloadToken } from '#/useCases/auth/auth.dto';

import { LogClass } from '../logger/log-decorator';

const cors = { origin: '*' };

export type ISocketClientResponse<T = Record<string, any>> = T & {
  success: boolean;
  message: string;
};

export interface ISocketClient {
  id: string;
  auth: IPayloadToken;
  socket: Socket;
  latence: number;
}

@LogClass
export class SocketService {
  public io: ServerIo;
  public clients: ISocketClient[];

  constructor() {
    this.clients = [];
  }

  private addClient(data: ISocketClient) {
    this.clients.push(data);
  }

  private removeClient(socketId: string) {
    this.clients = this.clients.filter(f => f.id !== socketId);
  }

  public createFromExpress(server: http.Server) {
    this.io = new ServerIo(server, { cors });

    this.io.use((socket, next) => {
      const token = (socket?.handshake?.query && socket?.handshake?.query?.token) as string;
      let auth: IPayloadToken = null;
      if (token) {
        try {
          auth = verify(token, jwtConfig.secret) as IPayloadToken;
        } catch {
          next();
          // return next(new HttpException(401, 'invalid_token'));
        }
        socket.auth = auth;

        next();
      } else {
        next();
        // next(new HttpException(401, 'restrict_access'));
      }
    });

    return this.io;
  }

  init() {
    this.io.on('connection', socket => {
      const id = `${socket?.id}`;

      this.addClient({ id, auth: socket.auth, socket, latence: 1000 });
      logging(`USER CONNECTED`, id);

      socket.on('disconnect', () => {
        this.removeClient(id);
        logging(`USER DISCONNECTED`, id);
      });
    });

    return this;
  }

  private withTimeout<T = any>(handler: () => Promise<ISocketClientResponse<T>>, timeout = 5000) {
    let t: any = null;

    const result: ISocketClientResponse = { success: false, message: 'timeout' };

    const timer = () =>
      new Promise<ISocketClientResponse>(resolve => {
        t = setTimeout(() => {
          logError(`TIMEOUT ${timeout}ms`);
          resolve({ ...result, message: 'timeout' });
        }, timeout);
      });

    const execute = () =>
      new Promise<ISocketClientResponse>(resolve => {
        handler().then(response => {
          resolve({ ...result, ...response });
          clearTimeout(t);
        });
      });

    return Promise.race([execute(), timer()]);
  }

  first() {
    return this.clients.length ? this.clients[0] : null;
  }

  firstSocket() {
    return this.clients.length ? this.clients[0]?.socket : null;
  }

  async getStatus() {
    const uid = uuidV4();
    const result: ISocketClientResponse = { success: false, message: 'client offline' };

    const client = this.first();
    if (!client) return result;

    const execute = () =>
      new Promise<ISocketClientResponse>(resolve => {
        client.socket.emit('status', { uid }, async (response: ISocketClientResponse) => {
          resolve({ ...result, ...response });
        });
      });

    return this.withTimeout(execute);
  }

  async sendText(data: any): Promise<ISocketClientResponse> {
    const uid = uuidV4();
    const result: ISocketClientResponse = { success: false, message: 'timeout' };

    const client = this.first();
    if (!client) return result;

    const execute = () =>
      new Promise<ISocketClientResponse>(resolve => {
        client.socket.emit('send-text', { uid, ...data }, async (response: ISocketClientResponse) => {
          resolve({ ...result, ...response });
        });
      });

    return this.withTimeout(execute);
  }
}
