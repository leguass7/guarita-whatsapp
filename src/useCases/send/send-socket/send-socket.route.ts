import { Router } from 'express';

import { socketService } from '#/services/socket.service';

import { SendSocketController } from './send-socket.controller';
import { SendSocketService } from './send-socket.service';

const sendSocketService = new SendSocketService(socketService);
const controller = new SendSocketController(sendSocketService);
const SendSocketRoute = Router();

SendSocketRoute.post('/text', (req, res, next) => controller.sendMessage(req, res, next));

export { SendSocketRoute, sendSocketService };
