import { isDevMode } from '#/config';
import type { EmailServiceResponseDto, EmailService } from '#/services/EmailService';
import type { IJob, QueueService, JobOptions } from '#/services/QueueService';

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

const sendHtmlEmailJob = (mailService: EmailService): IJob<JobNames, SendContingencyEmailPayload> => ({
  name: 'SendHtmlEmailJob',
  async handle({ data }) {
    const { email: to, html, subject } = data;

    // const mailService = new MailService('smtp', loggerService);
    const response = await mailService.send({ to, subject: `${subject}${isDevMode ? ' (TESTE)' : ''}`, html });
    return response?.messageId;
  },
});

const sendGeneralEmailJob = (mailService: EmailService): IJob<JobNames, SendGeneralEmailPayload> => {
  return {
    name: 'sendGeneralEmailJob',
    async handle({ data }) {
      const { email: to, text, subject } = data;

      // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
      // return { status: 1, msg: 'test' };
      const response = await mailService.send({ to, html: text, subject: `${subject}${isDevMode ? ' (TESTE)' : ''}` });
      return response as EmailServiceResponseDto;
    },
  };
};

// QUEUE

export const defaultJobOptions: JobOptions = {
  delay: 10,
  attempts: 2,
  timeout: 10000,
  backoff: { type: 'exponential', delay: 60000 * 30 },
};

export function createSendHtmlEmailJob(smtpService: EmailService) {
  return {
    sendHtmlEmailJob: sendHtmlEmailJob(smtpService),
    sendGeneralEmailJob: sendGeneralEmailJob(smtpService),
  };
}
