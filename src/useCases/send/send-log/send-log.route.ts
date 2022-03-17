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
  .onTryFailed('SendFailures', ({ data, failedReason }) => {
    logError(`SendFailures TRYING`, failedReason, data.startedIn);
  })
  .onFailed('SendFailures', ({ data, failedReason }) => {
    logError(`SendFailures ERROR`, failedReason, data.startedIn);
  })
  .onSuccess('SendFailures', ({ data }) => {
    logging(`RELATÓRIO DE FALHAS ENVIADO POR E-MAIL ${env.CRON_SENDLOGS} ${data.startedIn}`);
  })
  .add(
    'SendFailures',
    { startedIn: new Date() },
    { repeat: { cron: env.CRON_SENDLOGS }, removeOnComplete: true },
  );

const controller = new SendLogController(sendLogService);
const SendLogRoute = Router();

SendLogRoute.get('/now', getSendNowSchema, (req, res, next) => controller.now(req, res, next));

export { SendLogRoute, sendLogService, sendLogsQueue, sendLogsBodyQueue };
