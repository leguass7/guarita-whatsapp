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
import { LogClass } from '../logger/log-decorator';

type EventType = 'success' | 'failed' | 'trying';

type EventItem<T = any> = {
  uid: string;
  eventType: EventType;
  key: string;
  callback: FailedEventCallback<T> | CompletedEventCallback<T>;
};

export interface IJob<K extends string = any, J = any> {
  uid?: string;
  name: K;
  handle: ProcessCallbackFunction<J>;
  options?: JobOptions;
}

@LogClass
export class QueueService<K extends string = any, T = any> {
  private eventList: EventItem<T>[];
  public queue: Queue;

  constructor(
    private queueName: string,
    public jobs: IJob<K, T>[],
    queueOptions: QueueOptions = {},
  ) {
    this.eventList = [];
    this.queue = new Bull(queueName, { redis: redisConfig, ...queueOptions });
  }

  public log(message: string, type: 'error' | 'info' = 'error') {
    LoggerJobs[type](`QueueService ${message}`);
  }

  public onTryFailed(key: K, callback: FailedEventCallback<T>) {
    this.eventList.push({ key, eventType: 'trying', callback, uid: uuidV4() });
    return this;
  }

  public onFailed(key: K, callback: FailedEventCallback<T>) {
    this.eventList.push({ key, eventType: 'failed', callback, uid: uuidV4() });
    return this;
  }

  public onSuccess(key: K, callback: CompletedEventCallback<T>) {
    this.eventList.push({ key, eventType: 'success', callback, uid: uuidV4() });
    return this;
  }

  async add(jobName: K, data: T, jobOptions: JobOptions = {}): Promise<Job<T>> {
    const job = await this.queue.add(jobName, data, { ...jobOptions });
    return job;
  }

  async destroy() {
    const jobs = await this.queue.getJobs(['waiting', 'paused', 'delayed', 'active', 'completed']);
    await Promise.all(jobs.map(job => job?.remove().catch(() => null)));
    try {
      this.queue.close(true).catch(() => null);
    } finally {
      return true;
    }
  }

  public process() {
    const processEvents = async (
      eventType: EventType,
      job: Job,
      payload: Error | any,
      attemptsRest = 0,
    ): Promise<void> => {
      const processList = this.eventList.filter(
        f => f.key === job.name && f.eventType === eventType,
      );

      const remove = !!(eventType !== 'trying' || (eventType === 'trying' && attemptsRest <= 1));

      processList.forEach(itemJob => {
        try {
          itemJob?.callback(job, payload);
          if (remove) this.eventList = this.eventList.filter(f => f.uid !== itemJob.uid);
        } catch (error) {
          this.log(
            `processEvents ${this.queueName}:
            ${eventType}:${job.name}:${job?.id} error:${job?.failedReason || error?.message}`,
          );
        }
      });
    };

    this.queue.on('failed', async (job, err) => {
      const attempts = Number(job.opts?.attempts) || 0;
      const attemptsMade = Number(job?.attemptsMade) || 0;

      if (attemptsMade >= attempts) {
        this.log(`${this.queueName} ${job.name}:${job?.id} failed:${job?.failedReason}`);
        processEvents('failed', job, err);
      } else {
        this.log(`${this.queueName} ${job.name}:${job?.id} trying:${attemptsMade}`, 'info');
        processEvents('trying', job, err, attempts - attemptsMade);
      }
    });

    this.queue.on('completed', async (job, result) => {
      this.log(`${this.queueName} ${job.name}:${job?.id} complete`, 'info');
      processEvents('success', job, result);
    });

    return Promise.all(
      this.jobs.map(async jobItem => {
        return this.queue.process(jobItem.name, 1, jobItem.handle);
      }),
    );
  }
}
