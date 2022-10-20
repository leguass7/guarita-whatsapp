import { Router } from 'express';

import { prefix } from '#/config';
import { QueueService } from '#/services/QueueService';
import { emailSentService } from '#/useCases/email';
import { loggerService } from '#/useCases/logger.service';
import { smtpService } from '#/useCases/smtp.service';

import { SendEmailController } from './send-email.controller';
import { SendEmailHbs } from './send-email.hbs';
import { createSendHtmlEmailJob, defaultJobOptions } from './send-email.job';
import { SendEmailService } from './send-email.service';

const { sendHtmlEmailJob, sendGeneralEmailJob } = createSendHtmlEmailJob(smtpService);

const sendEmailQueue = new QueueService('SEND_EMAIL_QUEUE', [sendHtmlEmailJob, sendGeneralEmailJob], {
  defaultJobOptions,
  prefix: prefix,
  limiter: { max: 100, duration: 60 * 1000 * 60 * 24 },
});

const sendEmailHbs = new SendEmailHbs();
const sendEmailService = new SendEmailService(loggerService, emailSentService, sendEmailQueue, sendEmailHbs);
const controller = new SendEmailController(sendEmailService);
const EmailSendRoute = Router();

EmailSendRoute.post('/', (req, res, next) => controller.general(req, res, next));

export { EmailSendRoute, sendEmailQueue, sendEmailService };
