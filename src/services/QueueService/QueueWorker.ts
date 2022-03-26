import { CompletedEventCallback, FailedEventCallback, Job, JobOptions, Queue } from 'bull';

import { logging } from '../logger';

export type FailedPromiseCallback<T, R = any> = (job: Job<T>, result: any) => Promise<R>;
export interface QueueWorkerCallback<T = any> {
  success?: [CompletedEventCallback<T>, boolean];
  trying?: [FailedEventCallback<T>, boolean];
  failed?: [FailedEventCallback<T>, boolean];
}

export type ProcessType = keyof QueueWorkerCallback;

export type JobId = string | number;

export class QueueWorker<T = any, K extends string = any> {
  public jobId: JobId;
  public queueWorkerCallback: QueueWorkerCallback;

  constructor(private queue: Queue, private jobName: K) {
    this.queueWorkerCallback = {};
  }

  public success(callback?: CompletedEventCallback<T>, removeWorkerAfter?: boolean) {
    this.queueWorkerCallback.success = [callback, !!removeWorkerAfter];
    return this;
  }

  public trying(callback?: FailedEventCallback<T>, removeWorkerAfter?: boolean) {
    this.queueWorkerCallback.trying = [callback, !!removeWorkerAfter];
    return this;
  }

  public failed(callback?: FailedEventCallback<T>, removeWorkerAfter?: boolean) {
    this.queueWorkerCallback.failed = [callback, !!removeWorkerAfter];
    return this;
  }

  public async save<G = T>(data?: G, jobOptions: JobOptions = {}) {
    const job = await this.queue.add(this.jobName, data, { ...jobOptions });
    logging('QueueWorker job adicionado', job.name);
    this.jobId = job?.id;
    return job;
  }

  public processor<P extends ProcessType>(type: P): QueueWorkerCallback[P] {
    return this.queueWorkerCallback[type];
  }
}
