import { NotImplementedException } from '#/app/exceptions/NotImplementedException';
import { MailService, EmailException, EmailServiceResponseDto } from '#/services/EmailService';
import { logError } from '#/services/logger';
import { IJob, QueueService } from '#/services/QueueService';

export type SendContingencyEmailPayload = {
  email: string;
  text?: string;
  url?: string;
};

export type JobNames = 'SendContingencyEmail';

export type SendContingencyQueueService = QueueService<JobNames, SendContingencyEmailPayload>;

export const sendContingencyEmail: IJob<JobNames, SendContingencyEmailPayload> = {
  name: 'SendContingencyEmail',
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
