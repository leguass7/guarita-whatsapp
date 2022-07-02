// import 'express-async-errors';
import cors from 'cors';
import express, { Express } from 'express';
import useragent from 'express-useragent';
import helmet from 'helmet';
import { Server, createServer } from 'http';
import morgan from 'morgan';
import requestIp from 'request-ip';

import type { LoggerService } from '#/services/LoggerService';
import type { SocketServerService } from '#/services/SocketServerService';
import { queues } from '#/useCases/index.job';
import { IndexRoute } from '#/useCases/index.route';

import { errorMiddleware } from './error.middleware';

type NodeEnv = 'development' | 'production' | 'testing';

export interface IAppOptions {
  port: number;
  env: NodeEnv;
}

export class AppExpress {
  private readonly port: number;
  public express: Express;
  private readonly env: NodeEnv;
  private readonly server: Server;
  private started: boolean;

  constructor({ port, env }: IAppOptions, private readonly socketServerService: SocketServerService, private readonly loggerService?: LoggerService) {
    this.port = port;
    this.env = env;
    this.express = express();
    this.server = createServer(this.express);
    this.started = false;
    if (this.socketServerService) this.socketServerService.createFromExpress(this.server);
    return this;
  }

  private socketServer() {
    if (this.socketServerService) {
      this.socketServerService.init();
    }
  }

  private middlewares() {
    this.express.use(helmet());
    this.express.use(cors({ origin: '*' }));
    this.express.use(requestIp.mw());
    this.express.use(useragent.express());
    this.express.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.express.use(express.json({ limit: '10mb' }));
    this.express.use(morgan('dev'));
  }

  private routes() {
    this.express.use(IndexRoute);
    this.express.use(errorMiddleware);
  }

  private async startQueues() {
    // return Promise.all(queues.map(queue => queue?.process()));
    queues.map(queue => queue?.process());
  }

  public async close() {
    return Promise.all(queues.map(queue => queue?.destroy()));
  }

  async start() {
    this.middlewares();
    this.routes();
    this.socketServer();

    await this.startQueues();
    this.started = true;
    return this;
  }

  async listen() {
    try {
      if (!this.started) await this.start();
      return this.server.listen(this.port, () => {
        if (this.loggerService) {
          this.loggerService.logging(`STARTED SERVER development=${this.env}`, `PORT=${this.port}`);
        }
      });
    } catch {
      if (this.loggerService) {
        this.loggerService.logError(`Server ERROR`);
      }
    }
  }

  startSchedules() {
    return this;
  }
}
