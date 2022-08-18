import { Socket } from 'socket.io';

import type { SocketServerService } from '.';
import { ClientToServerEvents } from './client-to-server/socket-client.dto';
import { ServerToClientEvents } from './server-to-client/socket-server.dto';

export type EventHandlerName = keyof ClientToServerEvents;
export type EventHandlerValue<E extends EventHandlerName> = ClientToServerEvents[E];
export type FeatureHandler = [EventHandlerName, EventHandlerValue<any>];

export type SocketRouteHandler<E extends EventHandlerName> = EventHandlerValue<E> extends (...a: infer U) => infer R
  ? (b: SocketServerService, socket: Socket<ServerToClientEvents, ClientToServerEvents>, ...a: U) => R
  : never;

export class SocketRoute {
  private feature: FeatureHandler;

  public getFeature() {
    return this.feature || [];
  }

  public use<E extends EventHandlerName>(event: E, handler: SocketRouteHandler<E>): void {
    this.feature = [event, handler];
  }
}

export const SocketRouter = () => new SocketRoute();
