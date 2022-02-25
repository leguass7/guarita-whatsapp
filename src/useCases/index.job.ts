import { QueueService } from '#/services/QueueService';
import { sendMaxbotJob } from '#useCases/send/send.route';

export const queues: QueueService[] = [sendMaxbotJob];
