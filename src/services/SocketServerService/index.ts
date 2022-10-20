import http from 'http';
import { verify } from 'jsonwebtoken';
import { EventEmitter } from 'node:events';
import { Server as ServerIo, Socket } from 'socket.io';
import { v4 as uuidV4 } from 'uuid';

import { jwtConfig } from '#/config';
import type { IPayloadToken } from '#/useCases/auth/auth.dto';

import type { LoggerService } from '../LoggerService';
import { LogClass } from '../LoggerService/log-class.decorator';
import type { ClientToServerEvents } from './client-to-server/socket-client.dto';
import type { RequestSendTextDto } from './server-to-client/send-text.dto';
import type { ISocketClientResponse, ServerToClientCallback, ServerToClientEvents } from './server-to-client/socket-server.dto';
import { SocketServerEmitterHandler, SocketServerEvent, SocketServerEventPayload } from './socker-server.emitter';
import { EventHandlerName, EventHandlerValue, FeatureHandler, SocketRoute, SocketRouter } from './SocketRoute';

const cors = { origin: '*' };

export { SocketRoute, SocketRouter };

export type SocketClient = Socket<ClientToServerEvents, ServerToClientEvents>;

export interface ISocketClient {
  id: string;
  auth: IPayloadToken;
  socket: SocketClient;
  latence: number;
}

@LogClass
export class SocketServerService {
  public io: ServerIo<ClientToServerEvents, ServerToClientEvents>;
  public clients: ISocketClient[];
  private features: FeatureHandler[];
  private diconnectedAs: Date;
  private emitter = new EventEmitter();

  constructor(private readonly loggerService: LoggerService) {
    this.clients = [];
    this.features = [];
  }

  hasListener<T extends SocketServerEvent>(event: T) {
    return !!(this.emitter.listenerCount(event) > 0);
  }

  emit<T extends SocketServerEvent>(event: T, payload: SocketServerEventPayload<T>) {
    if (this.hasListener(event)) this.emitter.emit(event, payload);
  }

  on<T extends SocketServerEvent>(event: T, fn: SocketServerEmitterHandler<T>) {
    this.emitter.on(event, fn);
  }

  off<T extends SocketServerEvent>(event: T, fn: SocketServerEmitterHandler<T>) {
    this.emitter.on(event, fn);
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

  use(router: SocketRoute | SocketRoute[]) {
    const add = (r: SocketRoute) => {
      const [event, handler] = r.getFeature();
      if (event && handler) this.features.push([event, handler]);
    };

    if (Array.isArray(router)) {
      router.forEach(route => add(route));
    } else {
      add(router);
    }
  }

  private featureHandler<T extends EventHandlerName>(
    socket: Socket,
    eventName: EventHandlerName,
    ...args: [EventHandlerValue<T>, ServerToClientCallback]
  ) {
    this.features
      .filter(feat => feat && feat[0] && feat[0] === eventName)
      .forEach(([, handler]) => {
        try {
          if (handler) handler(this, socket, ...args);
        } catch (error) {
          this.loggerService.logError('featureHandler', eventName, error);
        }
      });
  }

  init() {
    this.io.on('connection', socket => {
      const id = `${socket?.id}`;

      this.addClient({ id, auth: socket.auth, socket, latence: 1000 });
      this.emit('onConnect', { id, auth: socket.auth, socket, latence: 1000 });
      this.loggerService.logging(`USER CONNECTED`, id);

      socket.on('disconnect', () => {
        this.removeClient(id);
        this.diconnectedAs = new Date();
        this.emit('onDisconnect', socket);
        this.loggerService.logging(`USER DISCONNECTED`, id);
      });

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      socket.onAny((eventName: EventHandlerName, data: EventHandlerValue<any> = {}, cb: ServerToClientCallback = () => {}) => {
        this.loggerService.logging('EVENT', eventName);
        if (eventName) this.featureHandler(socket, eventName, data, cb);
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
          this.loggerService.logError(`TIMEOUT ${timeout}ms`);
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
        client.socket.emit('status', { uid }, async response => {
          resolve({ ...result, ...response });
        });
      });

    return this.withTimeout(execute);
  }

  async sendText(data: RequestSendTextDto): Promise<ISocketClientResponse> {
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
