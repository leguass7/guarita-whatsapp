import Bull, { QueueOptions, Queue, JobOptions, ProcessCallbackFunction, Job } from 'bull';
import { v4 as uuidV4 } from 'uuid';

import { redisConfig } from '#/config/redis';

import { LoggerJobs } from '../logger';
import { LogClass } from '../logger/log-decorator';
import { QueueWorker, ProcessType } from './QueueWorker';

export type { JobOptions };

type WorkerItem<T = any> = {
  worker: QueueWorker<T>;
  uid: string;
  jobName: string;
};

export interface IJob<K extends string = any, J = any> {
  uid?: string;
  name: K;
  handle: ProcessCallbackFunction<J>;
  options?: JobOptions;
}

@LogClass
export class QueueService<K extends string = any, T = any> {
  private workers: WorkerItem<T>[];
  private starters: ((q: QueueService<K, T>) => void)[];
  public queue: Queue;

  constructor(private queueName: string, public jobs: IJob<K, T>[], queueOptions: QueueOptions = {}) {
    this.workers = [];
    this.starters = [];
    this.queue = new Bull(queueName, { redis: redisConfig, ...queueOptions });
  }

  private register() {
    this.starters = this.starters
      .map(cb => {
        if (cb) cb(this);
        return null;
      })
      .filter(f => !!f);
  }

  private async processEvents(eventType: ProcessType, job: Job, payload: Error | any, attemptsRest = 0): Promise<void> {
    let removeUid = '';

    const processWorker = this.workers.find(({ worker, jobName }) => {
      return !!(jobName === job.name && worker.jobId === job.id);
    });

    if (processWorker) {
      const [callback, removeMe] = processWorker.worker.processor(eventType);
      try {
        if (callback) callback(job, payload);
      } finally {
        if (removeMe) removeUid = processWorker.uid;
      }
    }

    const remove = !!(eventType !== 'trying' || (eventType === 'trying' && attemptsRest <= 1));
    if (removeUid && remove) this.removeWorker(removeUid);
  }

  public log(message: string, type: 'error' | 'info' = 'error') {
    LoggerJobs[type](`QueueService ${this.queueName} ${message}`);
  }

  async add(jobName: K, data: T, jobOptions: JobOptions = {}): Promise<Job<T>> {
    const job = await this.queue.add(jobName, data, { ...jobOptions });
    return job;
  }

  public removeWorker(workerId: string) {
    this.workers = this.workers.filter(f => f.uid !== workerId);
  }

  public setWorker(jobName: K) {
    const worker = new QueueWorker<T, K>(this.queue, jobName);
    this.workers.push({ uid: uuidV4(), jobName, worker });
    return worker;
  }

  public onInit(callback: (q: this) => void) {
    this.starters.push(callback);
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

  public async process() {
    this.queue.on('completed', async (job, result) => {
      this.log(`${this.queueName} ${job.name}:${job?.id} complete`, 'info');
      this.processEvents('success', job, result);
    });

    this.queue.on('failed', async (job, err) => {
      const attempts = Number(job.opts?.attempts || 0) || 0;
      const attemptsMade = Number(job?.attemptsMade || 0) || 0;

      if (attemptsMade >= attempts) {
        this.log(`${this.queueName} ${job.name}:${job?.id} failed:${job?.failedReason}`);
        this.processEvents('failed', job, err);
      } else {
        this.log(`${this.queueName} ${job.name}:${job?.id} trying:${attemptsMade}`, 'info');
        this.processEvents('trying', job, err, attempts - attemptsMade);
      }
    });

    this.jobs.forEach(async jobItem => {
      this.queue.process(jobItem.name, 1, jobItem.handle);
    });

    this.register();
  }
}
