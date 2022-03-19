import { QueueService } from '#/services/QueueService';
import { sendMaxbotQueue, sendLogsQueue, sendLogsBodyQueue, sendEmailQueue } from '#useCases/send';

export const queues: QueueService[] = [
  sendMaxbotQueue,
  sendLogsQueue,
  sendLogsBodyQueue,
  sendEmailQueue,
];
