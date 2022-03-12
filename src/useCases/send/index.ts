import { env } from '#/config';
import { logError, logging } from '#/services/logger';
import { QueueService } from '#/services/QueueService';

import { createSendLogJob } from './send-log/job/send-log.job';
import { sendLogService } from './send.route';

const sendLogsQueue = new QueueService('SENDLOGS_QUEUE', [createSendLogJob(sendLogService)], {
  defaultJobOptions: {
    delay: 10,
    attempts: 2,
    timeout: 10000,
    backoff: { type: 'exponential', delay: 60000 * 30 },
  },
  prefix: 'GUARITA_WHATSAPP',
  // limiter: { max: 1, duration: 500 },
});

sendLogsQueue
  .onTryFailed('SendFailures', ({ failedReason }) => logError('TENTATIVA NO EMAIL', failedReason))
  .onFailed('SendFailures', ({ failedReason }) => logError('FALHA NO EMAIL', failedReason))
  .onSuccess('SendFailures', () => logging(`RELATÓRIO DE FALHAS ENVIADO ${env.CRON_SENDLOGS}`))
  .add(
    'SendFailures',
    { startedIn: new Date() },
    { repeat: { cron: env.CRON_SENDLOGS }, removeOnComplete: true },
  );

export { SendRoute, sendService, sendLogService, sendMaxbotQueue } from './send.route';
export { sendLogsQueue };
