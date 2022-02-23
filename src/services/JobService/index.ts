import Bull, {
  CompletedEventCallback,
  FailedEventCallback,
  Job,
  JobOptions,
  Queue,
  QueueOptions,
} from 'bull';
import { v4 as uuidV4 } from 'uuid';

import { redisConfig } from '#/config/redis';

import { LoggerJobs } from '../logger';
import { LogClass } from '../logger/log-decorator';

export interface IRegisterJob<K = any> {
  key: K;
  handle: (...args: any[]) => void;
  options?: JobOptions;
}

interface IJob {
  name: string;
  handle: (...args: any[]) => void;
  options?: JobOptions;
  bull: Queue;
}

type Item<T = any> = {
  uid: string;
  key: string;
  handler: FailedEventCallback<T>;
};

@LogClass
export class JobService<K extends string = any, P = any> {
  private failedList: Item[];
  private successList: Item[];
  public queues: IJob[];

  constructor(jobs: Record<string, IRegisterJob>, queueOptions: QueueOptions = {}) {
    this.failedList = [];
    this.successList = [];

    this.queues = Object.values(jobs).map(job => ({
      bull: new Bull(job.key, { redis: redisConfig, ...queueOptions }),
      name: job.key,
      handle: job.handle,
      options: job.options,
    }));

    return this;
  }

  public log(message: string, type: 'error' | 'info' = 'error') {
    LoggerJobs[type](`JobService ${message}`);
  }

  public onFailed(key: K, handler: FailedEventCallback<P>) {
    this.failedList.push({ key, handler, uid: uuidV4() });
    return this;
  }

  public onSuccess(key: K, handler: CompletedEventCallback<P>) {
    this.successList.push({ key, handler, uid: uuidV4() });
    return this;
  }

  public add(key: K, data: P, options: JobOptions = {}) {
    const queue = this.queues.find(queue => queue.name === key);
    if (!queue) this.log(`Chave da fila não registrada '${key}'`, 'error');
    return queue && queue.bull.add(data, { ...queue?.options, ...options });
  }

  public async process() {
    return Promise.all(
      this.queues.map(async queue => {
        queue.bull.process(2, queue.handle);

        const processFails = (job: Job, err: Error) => {
          const failedList = this.failedList.filter(f => f.key === queue.name);
          failedList.forEach(failedJob => {
            try {
              failedJob?.handler(job, err);
              this.failedList = this.failedList.filter(f => f.uid !== failedJob.uid);
            } catch (error) {
              this.log(`failedList ${queue.name}:${job?.id} failed:${job?.failedReason}`);
            }
          });
        };

        const processSuccess = (job: Job, result: any) => {
          const successList = this.successList.filter(f => f.key === queue.name);
          successList.forEach(successJob => {
            try {
              successJob?.handler(job, result);
              this.successList = this.successList.filter(f => f.uid !== successJob.uid);
            } catch (error) {
              this.log(
                `successList ${queue.name}:${job?.id} error:${job?.failedReason || error?.message}`,
              );
            }
          });
        };

        queue.bull.on('failed', (job, err) => {
          const attempts = Number(job.opts?.attempts) || 0;
          const attemptsMade = Number(job?.attemptsMade) || 0;
          if (attemptsMade >= attempts) {
            this.log(`${queue.name}:${job?.id} failed:${job?.failedReason}`);
            processFails(job, err);
          } else {
            this.log(`${queue.name}:${job?.id} trying:${attemptsMade}`, 'info');
          }
        });

        queue.bull.on('completed', (job, result) => {
          processSuccess(job, result);
        });

        return true;
      }),
    );
  }
}
