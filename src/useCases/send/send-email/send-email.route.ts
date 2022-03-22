import { Router } from 'express';

import { prefix } from '#/config';
import { QueueService } from '#/services/QueueService';
import { emailSentService } from '#/useCases/email';

import { SendEmailController } from './send-email.controller';
import { defaultJobOptions, sendContingencyEmailJob, sendGeneralEmailJob } from './send-email.job';
import { SendEmailService } from './send-email.service';

const sendEmailQueue = new QueueService('SEND_EMAIL_QUEUE', [sendContingencyEmailJob, sendGeneralEmailJob], {
  defaultJobOptions,
  prefix: prefix,
});

const sendEmailService = new SendEmailService(emailSentService, sendEmailQueue);
const controller = new SendEmailController(sendEmailService);
const EmailSendRoute = Router();

EmailSendRoute.post('/', (req, res, next) => controller.general(req, res, next));

export { EmailSendRoute, sendEmailQueue, sendEmailService };
