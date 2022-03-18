import { MailService, EmailException, EmailServiceResponseDto } from '#/services/EmailService';
import { logError } from '#/services/logger';
import { IJob, QueueService } from '#/services/QueueService';

export type SendEmailPayload = {
  email: string;
  text?: string;
  url?: string;
};

export type JobNames = 'SendEmail';

export type SendQueueService = QueueService<JobNames, SendEmailPayload>;

export const sendMaxbotMessage: IJob<JobNames, SendEmailPayload> = {
  name: 'SendEmail',
  async handle({ data }) {
    const { email: to, text } = data;

    const mailService = new MailService('smtp');

    // throw new MaxbotException('teste', { msg: 'Failure', status: 0 });
    // return { status: 1, msg: 'test' };

    const response = await mailService.send({
      to,
      html: text,
      subject: '',
    });

    if (response.method === 'smtp') {
      logError(`SendMaxbotText status ${JSON.stringify(response)}`);
      throw new EmailException(response.msg, response);
    }

    return response as EmailServiceResponseDto;
  },
};
