import { Router } from 'express';

import { prefix } from '#/config';
import { QueueService } from '#/services/QueueService';

import {
  defaultJobOptions,
  createSendLogJob,
  sendLogJobBody,
  repeatRegister,
} from './job/send-log.job';
import { SendLogController } from './send-log.controller';
import { SendLogService } from './send-log.service';
import { getSendNowSchema } from './send-log.validation';

const sendLogsBodyQueue = new QueueService('SENDLOGSBODY_QUEUE', [sendLogJobBody], {
  defaultJobOptions,
  prefix,
});

const sendLogService = new SendLogService(sendLogsBodyQueue);

const sendLogsQueue = new QueueService('SENDLOGS_QUEUE', [createSendLogJob(sendLogService)], {
  defaultJobOptions,
  prefix,
});
sendLogsQueue.onInit(repeatRegister);

const controller = new SendLogController(sendLogService);
const SendLogRoute = Router();

SendLogRoute.get('/now', getSendNowSchema, (req, res, next) => controller.now(req, res, next));

export { SendLogRoute, sendLogService, sendLogsQueue, sendLogsBodyQueue };
