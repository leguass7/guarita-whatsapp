import { Router } from 'express';

import { CacheService } from '#/services/ChacheService';
import { QueueService } from '#/services/QueueService';

import { SendLogService } from './send-log/send-log.service';
import { sendMaxbotMessage, sendMaxbotImage, defaultJobOptions } from './send-maxbot.job';
import { SendController } from './send.controller';
import { SendService } from './send.service';
import { postSendSchema } from './send.validation';

const cacheService = new CacheService();
const sendLogService = new SendLogService();

const sendMaxbotQueue = new QueueService('MAXBOT_QUEUE', [sendMaxbotMessage, sendMaxbotImage], {
  defaultJobOptions,
  prefix: 'GUARITA_WHATSAPP',
  limiter: { max: 1, duration: 1000 },
});

const sendService = new SendService(sendMaxbotQueue, sendLogService, cacheService);
const controller = new SendController(sendService);

const SendRoute = Router();

SendRoute.post('/', postSendSchema, (req, res, next) => controller.sendMessage(req, res, next));

export { SendRoute, sendService, sendLogService, sendMaxbotQueue };
