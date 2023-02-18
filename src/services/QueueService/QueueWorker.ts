import { CompletedEventCallback, FailedEventCallback, Job, JobOptions, Queue } from 'bull';

import { loggerService } from '#/useCases/logger.service';

export type FailedPromiseCallback<T, R = any> = (job: Job<T>, result: any) => Promise<R>;
export type FailedCallback<T> = FailedEventCallback<T>; // | Promise<FailedEventCallback<T>>;
export type CompletedCallback<T> = CompletedEventCallback<T>; // | Promise<CompletedEventCallback<T>>;
export interface QueueWorkerCallback<T = any> {
  success?: [CompletedCallback<T>, boolean];
  trying?: [FailedCallback<T>, boolean];
  failed?: [FailedCallback<T>, boolean];
}

export type ProcessType = keyof QueueWorkerCallback;

export type JobId = string | number;

export class QueueWorker<T = any, K extends string = any> {
  public jobId: JobId;
  public queueWorkerCallback: QueueWorkerCallback;

  constructor(private queue: Queue, private jobName: K) {
    this.queueWorkerCallback = {};
  }

  public success(callback?: CompletedCallback<T>, removeWorkerAfter?: boolean) {
    this.queueWorkerCallback.success = [callback, !!removeWorkerAfter];
    return this;
  }

  public trying(callback?: FailedCallback<T>, removeWorkerAfter?: boolean) {
    this.queueWorkerCallback.trying = [callback, !!removeWorkerAfter];
    return this;
  }

  public failed(callback?: FailedCallback<T>, removeWorkerAfter?: boolean) {
    this.queueWorkerCallback.failed = [callback, !!removeWorkerAfter];
    return this;
  }

  public async save<G = T>(data?: G, jobOptions: JobOptions = {}) {
    const job = await this.queue.add(this.jobName, data, { ...jobOptions });
    loggerService.logging('QueueWorker job adicionado', job.name);
    this.jobId = job?.id;
    return job;
  }

  public processor<P extends ProcessType>(type: P): QueueWorkerCallback[P] {
    return this.queueWorkerCallback[type];
  }
}
