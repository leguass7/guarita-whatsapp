import { NotImplementedException } from '#/app/exceptions/NotImplementedException';
import { EmailServiceResponseDto, MailService } from '#/services/EmailService';
import { IJob, QueueService, JobOptions } from '#/services/QueueService';

export type SendEmailLayoutPayload = {
  trackImageURL: string;
  imageLogoURL: string;
  imageVendorURL: string;
};

export type SendContingencyEmailPayload = SendEmailLayoutPayload & {
  email: string;
  subject?: string;
  text?: string;
  url?: string;
};

export type JobNames = 'SendContingencyEmailJob' | 'sendGeneralEmailJob';

export type SendEmailQueueService = QueueService<JobNames, SendContingencyEmailPayload>;

export const sendContingencyEmailJob: IJob<JobNames, SendContingencyEmailPayload> = {
  name: 'SendContingencyEmailJob',
  async handle({ data }) {
    const { email: to, text } = data;

    const mailService = new MailService('smtp');

    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
    // return { status: 1, msg: 'test' };

    // const response = await mailService.send({ to, html: text, subject: '' });

    // if (response.method === 'smtp') {
    //   logError(`SendMaxbotText status ${JSON.stringify(response)}`);
    //   throw new EmailException(response.msg, response);
    // }

    throw new NotImplementedException();

    // return response as EmailServiceResponseDto;
  },
};

export const sendGeneralEmailJob: IJob<JobNames, SendContingencyEmailPayload> = {
  name: 'sendGeneralEmailJob',
  async handle({ data }) {
    const { email: to, text, subject } = data;

    const mailService = new MailService('smtp');

    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
    // return { status: 1, msg: 'test' };

    const response = await mailService.send({ to, html: text, subject });
    console.log('response', response);

    // if (response.method === 'smtp') {
    //   logError(`SendMaxbotText status ${JSON.stringify(response)}`);
    //   throw new EmailException(response.msg, response);
    // }

    // throw new NotImplementedException();

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
