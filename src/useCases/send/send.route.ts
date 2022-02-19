import { Router } from 'express';

import { JobService } from '#/services/JobService';

import { SendLogService } from './send-log/send-log.service';
import { sendMaxbotMessage, defaultJobOptions } from './send-maxbot.job';
import { SendController } from './send.controller';
import { SendService } from './send.service';

const sendMaxbotJob = new JobService({ sendMaxbotMessage }, { defaultJobOptions });
const sendLogService = new SendLogService();
const sendService = new SendService(sendMaxbotJob, sendLogService);
const controller = new SendController(sendService);

const SendRoute = Router();

SendRoute.post('/', (req, res, next) => controller.sendMessage(req, res, next));

export { SendRoute, sendService, sendMaxbotJob, sendLogService };
