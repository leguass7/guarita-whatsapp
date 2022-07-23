import { Router } from 'express';

import { prefix } from '#/config';
import { cacheService } from '#/services/CacheService/cache.service';
import { QueueService } from '#/services/QueueService';

import { EmailSendRoute, sendEmailService } from './send-email/send-email.route';
import { SendLogRoute, sendLogService } from './send-log/send-log.route';
import { sendMaxbotMessage, sendMaxbotImage, defaultJobOptions } from './send-maxbot.job';
import { SendSocketRoute } from './send-socket/send-socket.route';
import { SendController } from './send.controller';
import { SendService } from './send.service';
import { postSendSchema } from './send.validation';

const sendMaxbotQueue = new QueueService('MAXBOT_QUEUE', [sendMaxbotMessage, sendMaxbotImage], {
  defaultJobOptions,
  prefix,
  limiter: { max: 1, duration: 1000 * 60 },
});

const sendService = new SendService(sendMaxbotQueue, sendLogService, cacheService, sendEmailService);
const controller = new SendController(sendService);

const SendRoute = Router();

SendRoute.use('/email', EmailSendRoute);
SendRoute.use('/log', SendLogRoute);
SendRoute.use('/socket', SendSocketRoute);
SendRoute.post('/', postSendSchema, (req, res, next) => controller.sendMessage(req, res, next));

export { SendRoute, sendService, sendLogService, sendMaxbotQueue };
