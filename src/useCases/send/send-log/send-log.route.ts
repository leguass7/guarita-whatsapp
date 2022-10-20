import { Router } from 'express';

import { prefix } from '#/config';
import { dataSource } from '#/database';
import { QueueService } from '#/services/QueueService';
import { loggerService } from '#/useCases/logger.service';
import { smtpService } from '#/useCases/smtp.service';

import { defaultJobOptions, createSendLogJob, createSendLogBodyJob } from './job/send-log.job';
import { SendLogController } from './send-log.controller';
import { SendLogService } from './send-log.service';
import { getSendNowSchema } from './send-log.validation';

const { sendLogJobBody } = createSendLogBodyJob(smtpService);

const sendLogsBodyQueue = new QueueService('SENDLOGSBODY_QUEUE', [sendLogJobBody], { defaultJobOptions, prefix });
const sendLogService = new SendLogService(dataSource, sendLogsBodyQueue, loggerService);

const { repeatRegister, sendLogFailuresJob } = createSendLogJob(loggerService, sendLogService, smtpService);
const sendLogsQueue = new QueueService('SENDLOGS_QUEUE', [sendLogFailuresJob], { defaultJobOptions, prefix });
sendLogsQueue.onInit(repeatRegister);

const controller = new SendLogController(sendLogService);

const SendLogRoute = Router();
SendLogRoute.get('/now', getSendNowSchema, (req, res, next) => controller.now(req, res, next));

export { SendLogRoute, sendLogService, sendLogsQueue, sendLogsBodyQueue };
