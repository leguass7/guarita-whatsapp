import { QueueService } from '#/services/QueueService';
import { sendMaxbotQueue, sendLogsQueue, sendLogsBodyQueue, sendEmailQueue, sendSocketQueue } from '#useCases/send';

export const queues: QueueService[] = [sendMaxbotQueue, sendLogsQueue, sendLogsBodyQueue, sendEmailQueue, sendSocketQueue];
