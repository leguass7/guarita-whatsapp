import { logError } from '#/services/logger';
import { QueueService } from '#/services/QueueService';

import { createSendLogJob } from './send-log/job/send-log.job';
import { sendLogService } from './send.route';

const sendLogsQueue = new QueueService('SENDLOGS_QUEUE', [createSendLogJob(sendLogService)], {
  defaultJobOptions: {
    delay: 10,
    attempts: 2,
    timeout: 12000,
    backoff: { type: 'exponential', delay: 3000 },
  },
  prefix: 'GUARITA_WHATSAPP',
  limiter: { max: 1, duration: 1000 },
});

sendLogsQueue
  .onTryFailed('SendFailures', ({ failedReason }) => logError('TENTATIVA NO EMAIL', failedReason))
  .onFailed('SendFailures', ({ failedReason }) => logError('FALHA NO EMAIL', failedReason))
  //.add('SendFailures', { startedIn: new Date() }, { repeat: { cron: '10 15 * * *' } });
  .add('SendFailures', { startedIn: new Date() }, { repeat: { cron: '*/1 * * * *' } });

export { SendRoute, sendService, sendLogService, sendMaxbotQueue } from './send.route';
export { sendLogsQueue };
