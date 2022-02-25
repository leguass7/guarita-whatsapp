import Bull, {
  QueueOptions,
  Queue,
  JobOptions,
  ProcessCallbackFunction,
  Job,
  FailedEventCallback,
  CompletedEventCallback,
} from 'bull';
import { v4 as uuidV4 } from 'uuid';

import { redisConfig } from '#/config/redis';

import { LoggerJobs } from '../logger';

type Item<T = any> = {
  uid: string;
  key: string;
  callback: FailedEventCallback<T> | CompletedEventCallback<T>;
};

export interface IJob<K extends string = any, J = any> {
  uid?: string;
  name: K;
  handle: ProcessCallbackFunction<J>;
  options?: JobOptions;
}

export class QueueService<K extends string = any, T = any> {
  private failedList: Item[];
  private successList: Item[];
  public queue: Queue;

  constructor(
    private queueName: string,
    public jobs: IJob<K, T>[],
    queueOptions: QueueOptions = {},
  ) {
    this.successList = [];
    this.failedList = [];
    this.queue = new Bull(queueName, {
      redis: redisConfig,
      ...queueOptions,
      // limiter: { duration: 2000, max: 1 },
    });
  }

  public log(message: string, type: 'error' | 'info' = 'error') {
    LoggerJobs[type](`QueueService ${message}`);
  }

  public onFailed(jobName: K, callback: FailedEventCallback<T>) {
    this.failedList.push({ key: jobName, callback, uid: uuidV4() });
    return this;
  }

  public onSuccess(jobName: K, callback: CompletedEventCallback<T>) {
    this.successList.push({ key: jobName, callback, uid: uuidV4() });
    return this;
  }

  async add(jobName: K, data: T, jobOptions: JobOptions = {}): Promise<Job<T>> {
    const job = await this.queue.add(jobName, data, { ...jobOptions });
    return job;
  }

  public process() {
    const processFails = (job: Job, err: Error) => {
      const failedList = this.failedList.filter(f => f.key === job.name);
      failedList.forEach(failedJob => {
        try {
          failedJob?.callback(job, err);
          this.failedList = this.failedList.filter(f => f.uid !== failedJob.uid);
        } catch {
          this.log(`failedList ${job.name}:${job?.id} failed:${job?.failedReason}`);
        }
      });
    };

    const processSuccess = (job: Job, result: any) => {
      const successList = this.successList.filter(f => f.key === job.name);
      successList.forEach(successJob => {
        try {
          successJob?.callback(job, result);
          this.successList = this.successList.filter(f => f.uid !== successJob.uid);
        } catch (error) {
          this.log(
            `successList ${this.queueName} ${job.name}:${job?.id} error:${
              job?.failedReason || error?.message
            }`,
          );
        }
      });
    };

    this.queue.on('failed', (job, err) => {
      const attempts = Number(job.opts?.attempts) || 0;
      const attemptsMade = Number(job?.attemptsMade) || 0;
      this.log(`${this.queueName} ${job.name}:${job?.id} attemptsMade:${attemptsMade}`, 'info');

      if (attemptsMade >= attempts) {
        this.log(`${this.queueName} ${job.name}:${job?.id} failed:${job?.failedReason}`);
        processFails(job, err);
      } else {
        this.log(`${this.queueName} ${job.name}:${job?.id} trying:${attemptsMade}`, 'info');
      }
    });

    this.queue.on('completed', (job, result) => {
      this.log(`${this.queueName} ${job.name}:${job?.id} complete`, 'info');

      // console.log('result', result);
      processSuccess(job, result);
    });

    return Promise.all(
      this.jobs.map(async jobItem => {
        this.queue.process(jobItem.name, 1, jobItem.handle);
      }),
    );
  }
}

// interface Test {
//   id: number;
// }
// const j: IJob<Test>[] = [
//   { name: 'Teste1', handle: ({ data }) => console.log(data.id) },
//   { name: 'Teste2', handle: ({ data }) => console.log(data.id) },
// ];

// const a = new QueueService<string, Test>('teste', j);
// a.add('Teste1', { id: 1 }, { attempts: 2 }).then(job1 => job1.data.id);
