import { CompletedEventCallback, FailedEventCallback, JobOptions, Queue } from 'bull';
interface QueueWorkerOptions<K extends string = any, T = any> {
  jobName: K;
  data?: T;
  jobOptions?: JobOptions;
}
type ProcessType = 'success' | 'trying' | 'failed';

export class QueueWorker<T = any> {
  public jobId: string | number;
  private cbSuccess: CompletedEventCallback<T>;
  private cbTrying: FailedEventCallback<T>;
  private cbFailed: FailedEventCallback<T>;
  constructor(private queue: Queue, private options: QueueWorkerOptions) {}

  public success(callback?: CompletedEventCallback<T>) {
    this.cbSuccess = callback;
    return this;
  }

  public trying(callback?: FailedEventCallback<T>) {
    this.cbTrying = callback;
    return this;
  }

  public failed(callback?: FailedEventCallback<T>) {
    this.cbFailed = callback;
    return this;
  }

  public async save() {
    const { jobName, data = {}, jobOptions = {} } = this.options;
    const job = await this.queue.add(jobName, data, jobOptions);
    this.jobId = job?.id;
    return job;
  }

  public processor(type: ProcessType) {
    if (type === 'trying') return this.cbTrying;
    if (type === 'failed') return this.cbFailed;
    if (type === 'success') return this.cbSuccess;
  }
}
