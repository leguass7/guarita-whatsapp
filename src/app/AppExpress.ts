// import 'express-async-errors';
import cors from 'cors';
import express, { Express } from 'express';
import useragent from 'express-useragent';
import helmet from 'helmet';
import morgan from 'morgan';
import requestIp from 'request-ip';

import { logError, logging } from '#/services/logger';
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
  private readonly express: Express;
  private readonly env: NodeEnv;
  private started: boolean;

  constructor({ port, env }: IAppOptions) {
    this.port = port;
    this.env = env;
    this.express = express();
    this.started = false;
    return this;
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

  private startQueues() {
    queues.forEach(queue => queue?.process());
  }

  start() {
    this.middlewares();
    this.routes();
    this.startQueues();
    this.started = true;
    return this;
  }

  listen() {
    try {
      if (!this.started) this.start();
      return this.express.listen(this.port, () => {
        logging(`STARTED SERVER development=${this.env}`, `PORT=${this.port}`);
      });
    } catch {
      logError(`Server ERROR`);
    }
  }

  startSchedules() {
    return this;
  }
}
