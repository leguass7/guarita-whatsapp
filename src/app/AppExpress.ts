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
  public readonly express: Express;
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
    await this.startQueues();
    // const bulls = queues.reduce((acc, queue) => {
    //   queue.getQueues().forEach(q => acc.push(q.bull));
    //   return acc;
    // }, []);
    this.started = true;
    return this;
  }

  async listen() {
    try {
      if (!this.started) await this.start();
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
