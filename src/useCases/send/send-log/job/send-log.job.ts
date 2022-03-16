import { format } from 'date-fns';

import { isDevMode } from '#/config';
import { MailService } from '#/services/EmailService';
import type { IJob, QueueService, JobOptions } from '#/services/QueueService';

import { SendLogService } from '../send-log.service';
import { buildMailBody, MailFailedBody } from './send-log.html';

export type SendLogJobNames = 'SendFailures' | 'SendLogBody';

export type SendLogPayload = { startedIn?: Date };
export type SendLogPayloadBody = { subject: string } & MailFailedBody;

export type SendLogsQueue = QueueService<SendLogJobNames, SendLogPayload | SendLogPayloadBody>;

export const defaultJobOptions: JobOptions = {
  delay: 10,
  attempts: 2,
  timeout: 10000,
  backoff: { type: 'exponential', delay: 60000 * 30 },
};

export function createSendLogJob(
  sendLogService: SendLogService,
): IJob<SendLogJobNames, SendLogPayload> {
  return {
    name: 'SendFailures',
    handle: async () => {
      const date = new Date();

      const logs = await sendLogService.findByDate(date);

      const failedList = logs.filter(f => f.eventType === 'failed');
      const tryingLength = logs.filter(f => f.eventType === 'trying')?.length;
      const successLength = logs.filter(f => f.eventType === 'success')?.length;
      const txtDate = format(date, 'dd/MM/yyyy');

      const to = `Leandro Sbrissa <leandro.sbrissa@hotmail.com>${
        isDevMode ? `,Joaquim <atendimento01@dessistemas.com.br>` : ''
      }`;

      const mailService = new MailService('smtp');
      const sent = await mailService.send({
        from: 'Webmaster Avatar <webmaster@avatarsolucoesdigitais.com.br>',
        to,
        subject: `Falhas de envio dia ${txtDate}${isDevMode ? ' (TESTE)' : ''}`,
        html: buildMailBody({ date, successLength, failedList, tryingLength }),
      });

      return sent;
    },
  };
}

export const sendLogJobBody: IJob<SendLogJobNames, SendLogPayloadBody> = {
  name: 'SendLogBody',
  handle: async ({ data }) => {
    const { subject, ...rest } = data;

    const to = `Leandro Sbrissa <leandro.sbrissa@hotmail.com>${
      !isDevMode ? `, Joaquim <atendimento01@dessistemas.com.br>` : ''
    }`;

    const mailService = new MailService('smtp');
    const sent = await mailService.send({
      from: 'Webmaster Avatar <webmaster@avatarsolucoesdigitais.com.br>',
      to,
      subject,
      html: buildMailBody(rest),
    });

    return sent;
  },
};
