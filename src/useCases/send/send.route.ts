import { Router } from 'express';

import { QueueService } from '#/services/QueueService';

import { SendLogService } from './send-log/send-log.service';
import { sendMaxbotMessage, sendMaxbotImage, defaultJobOptions } from './send-maxbot.job';
import { SendController } from './send.controller';
import { SendService } from './send.service';
import { postSendSchema } from './send.validation';

const sendLogService = new SendLogService();

const sendMaxbotQueue = new QueueService('MAXBOT_QUEUE', [sendMaxbotMessage, sendMaxbotImage], {
  defaultJobOptions,
  limiter: { max: 2, duration: 1000 },
});

const sendService = new SendService(sendMaxbotQueue, sendLogService);
const controller = new SendController(sendService);

const SendRoute = Router();

SendRoute.post('/', postSendSchema, (req, res, next) => controller.sendMessage(req, res, next));

export { SendRoute, sendService, sendLogService, sendMaxbotQueue };
