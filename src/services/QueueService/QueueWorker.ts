import { CompletedEventCallback, FailedEventCallback, JobOptions, Queue } from 'bull';

import { logging } from '../logger';

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

  public async save(data?: T, jobOptions: JobOptions = {}) {
    const job = await this.queue.add(this.jobName, data, { ...jobOptions });
    logging('QueueWorker job adicionado', job.name);
    this.jobId = job?.id;
    return job;
  }

  public processor<P extends ProcessType>(type: P): QueueWorkerCallback[P] {
    return this.queueWorkerCallback[type];
  }
}
