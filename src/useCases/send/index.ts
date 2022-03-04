import { QueueService } from '#/services/QueueService';

import { createSendLogJob } from './send-log/send-log.job';
import { sendLogService } from './send.route';

export { SendRoute, sendService, sendLogService, sendMaxbotQueue } from './send.route';

const sendLogsQueue = new QueueService('SENDLOGS_QUEUE', [createSendLogJob(sendLogService)], {
  defaultJobOptions: {
    delay: 10,
    attempts: 3,
    timeout: 10000,
    backoff: { type: 'exponential', delay: 1000 },
  },
  prefix: 'GUARITA_WHATSAPP',
  limiter: { max: 1, duration: 2000 },
});
sendLogsQueue.add('SendFailure', { teste: '' }, { repeat: { cron: '10 12 * * *' } });

export { sendLogsQueue };
