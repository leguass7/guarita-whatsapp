import { QueueService } from '#/services/QueueService';
import { sendMaxbotQueue, sendLogsQueue } from '#useCases/send';

export const queues: QueueService[] = [sendMaxbotQueue, sendLogsQueue];
