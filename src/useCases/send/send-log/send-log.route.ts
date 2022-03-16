import { Router } from 'express';

import { env } from '#/config';
import { logError, logging } from '#/services/logger';
import { QueueService } from '#/services/QueueService';

import { defaultJobOptions, createSendLogJob, sendLogJobBody } from './job/send-log.job';
import { SendLogController } from './send-log.controller';
import { SendLogService } from './send-log.service';
import { getSendNowSchema } from './send-log.validation';
const prefix = 'GUARITA_WHATSAPP';

const sendLogsBodyQueue = new QueueService('SENDLOGSBODY_QUEUE', [sendLogJobBody], {
  defaultJobOptions,
  prefix,
});

const sendLogService = new SendLogService(sendLogsBodyQueue);

const sendLogsQueue = new QueueService('SENDLOGS_QUEUE', [createSendLogJob(sendLogService)], {
  defaultJobOptions,
  prefix,
});

sendLogsQueue
  .onTryFailed('SendFailures', ({ failedReason }) => logError('TENTATIVA NO EMAIL', failedReason))
  .onFailed('SendFailures', ({ failedReason }) => logError('FALHA NO EMAIL', failedReason))
  .onSuccess('SendFailures', ({ data }) =>
    logging(`RELATÓRIO DE FALHAS ENVIADO ${env.CRON_SENDLOGS} ${data.startedIn}`),
  )
  .add(
    'SendFailures',
    { startedIn: new Date() },
    { repeat: { cron: env.CRON_SENDLOGS }, removeOnComplete: true },
  );

const controller = new SendLogController(sendLogService);
const SendLogRoute = Router();

SendLogRoute.get('/now', getSendNowSchema, (req, res, next) => controller.now(req, res, next));

export { SendLogRoute, sendLogService, sendLogsQueue, sendLogsBodyQueue };
