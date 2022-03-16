import { QueueService } from '#/services/QueueService';
import { sendMaxbotQueue, sendLogsQueue, sendLogsBodyQueue } from '#useCases/send';

export const queues: QueueService[] = [sendMaxbotQueue, sendLogsQueue, sendLogsBodyQueue];
