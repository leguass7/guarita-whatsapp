import { isDevMode } from '#/config';
import { EmailServiceResponseDto, MailService } from '#/services/EmailService';
import { IJob, QueueService, JobOptions } from '#/services/QueueService';
import { loggerService } from '#/useCases/logger.service';

export type SendContingencyEmailPayload = {
  email: string;
  subject: string;
  html: string;
};

export type SendGeneralEmailPayload = {
  email: string;
  subject: string;
  text: string;
};

export type JobNames = 'SendHtmlEmailJob' | 'sendGeneralEmailJob';

export type SendEmailQueueService = QueueService<JobNames, SendContingencyEmailPayload | SendGeneralEmailPayload>;

export const sendHtmlEmailJob: IJob<JobNames, SendContingencyEmailPayload> = {
  name: 'SendHtmlEmailJob',
  async handle({ data }) {
    const { email: to, html, subject } = data;

    const mailService = new MailService('smtp', loggerService);
    const response = await mailService.send({ to, subject: `${subject}${isDevMode ? ' (TESTE)' : ''}`, html });
    return response?.messageId;
  },
};

export const sendGeneralEmailJob: IJob<JobNames, SendGeneralEmailPayload> = {
  name: 'sendGeneralEmailJob',
  async handle({ data }) {
    const { email: to, text, subject } = data;

    const mailService = new MailService('smtp', loggerService);
    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
    // return { status: 1, msg: 'test' };
    const response = await mailService.send({ to, html: text, subject: `${subject}${isDevMode ? ' (TESTE)' : ''}` });
    return response as EmailServiceResponseDto;
  },
};

// QUEUE

export const defaultJobOptions: JobOptions = {
  delay: 10,
  attempts: 2,
  timeout: 10000,
  backoff: { type: 'exponential', delay: 60000 * 30 },
};
