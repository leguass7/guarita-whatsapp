import type { ISocketClient, SocketClient } from '.';

export interface SocketServerEmitter {
  onConnect: ISocketClient;
  onDisconnect: any;
}

export type SocketServerEvent = keyof SocketServerEmitter;

export type SocketServerEventPayload<T extends SocketServerEvent> = SocketServerEmitter[T];
export type SocketServerEventReceiver<T extends SocketServerEvent> = (params: SocketServerEventPayload<T>) => void;

export type SocketServerEmitterHandler<E extends SocketServerEvent> = SocketServerEventReceiver<E> extends (...a: infer U) => infer R
  ? (socket: SocketClient, ...a: U) => R
  : never;
