import { Router } from 'express';

import { cacheService } from '#/services/CacheService/cache.service';
import { QueueService } from '#/services/QueueService';
import { loggerService } from '#/useCases/logger.service';
import { sendEmailService } from '#/useCases/send/send-email';
import { sendLogService } from '#/useCases/send/send-log/send-log.route';
import { socketServerService } from '#/useCases/socket.service';

import { SendSocketController } from './send-socket.controller';
import { sendSocketQueueOptions, createSendSocketJob } from './send-socket.job';
import { SendSocketService } from './send-socket.service';
import { sendSocketSchema } from './send-socket.validation';

const sendSocketJob = createSendSocketJob(socketServerService);

const sendSocketQueue = new QueueService('SOCKET_QUEUE', [sendSocketJob], sendSocketQueueOptions);

const sendSocketService = new SendSocketService(loggerService, socketServerService, sendSocketQueue, cacheService, sendLogService);
const controller = new SendSocketController(sendSocketService, sendEmailService);
const SendSocketRoute = Router();

SendSocketRoute.post('/message', sendSocketSchema, (req, res, next) => controller.sendMessage(req, res, next));
SendSocketRoute.post('/text', (req, res, next) => controller.sendText(req, res, next));
SendSocketRoute.get('/status', (req, res, next) => controller.getStatus(req, res, next));

export { SendSocketRoute, sendSocketService, sendSocketQueue };
