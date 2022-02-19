import { JobService } from '#/services/JobService';
import { sendMaxbotJob } from '#useCases/send/send.route';

export const queues: JobService<any>[] = [sendMaxbotJob];
