import { format } from 'date-fns';

import { env, isDevMode } from '#/config';
import type { EmailService } from '#/services/EmailService';
import type { LoggerService } from '#/services/LoggerService';
import type { IJob, QueueService, JobOptions } from '#/services/QueueService';
import type { SendLogService } from '#/useCases/send/send-log/send-log.service';

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

export function sendLogFailuresJob(sendLogService: SendLogService, mailService: EmailService): IJob<SendLogJobNames, SendLogPayload> {
  return {
    name: 'SendFailures',
    handle: async () => {
      const date = new Date();

      const logs = await sendLogService.findByDate(date);

      const failedList = logs.filter(f => f.eventType === 'failed');
      const tryingLength = logs.filter(f => f.eventType === 'trying')?.length;
      const successLength = logs.filter(f => f.eventType === 'success')?.length;
      const txtDate = format(date, 'dd/MM/yyyy');

      const to = `Leandro Sbrissa <leandro.sbrissa@hotmail.com>${!isDevMode ? `,Joaquim <atendimento01@dessistemas.com.br>` : ''}`;

      // const mailService = new MailService('smtp', loggerService);
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

export const sendLogJobBody = (mailService: EmailService): IJob<SendLogJobNames, SendLogPayloadBody> => ({
  name: 'SendLogBody',
  handle: async ({ data }) => {
    const { subject, ...rest } = data;

    const to = `Leandro Sbrissa <leandro.sbrissa@hotmail.com>${!isDevMode ? `, Joaquim <atendimento01@dessistemas.com.br>` : ''}`;

    // const mailService = new MailService('smtp', loggerService);
    const sent = await mailService.send({
      from: 'Webmaster Avatar <webmaster@avatarsolucoesdigitais.com.br>',
      to,
      subject,
      html: buildMailBody(rest),
    });

    return sent;
  },
});

export function repeatRegister(loggerService: LoggerService) {
  return async (queue: QueueService<SendLogJobNames, SendLogPayload>) => {
    const job = await queue
      .setWorker('SendFailures')
      .trying(({ data, failedReason }) => {
        loggerService.logError(`SendFailures TRYING`, failedReason, data.startedIn);
      })
      .failed(({ data, failedReason }) => {
        loggerService.logError(`SendFailures ERROR`, failedReason, data.startedIn);
      })
      .success(({ data }) => {
        loggerService.logging(`RELATÓRIO DE FALHAS ENVIADO POR E-MAIL ${env.CRON_SENDLOGS} ${data.startedIn}`);
      })
      .save({ startedIn: new Date() }, { repeat: { cron: env.CRON_SENDLOGS }, removeOnComplete: true });
    //
    loggerService.logging('repeatRegister', job.name, job.id);
  };
}

// ------------------

export function createSendLogBodyJob(mailService: EmailService) {
  return {
    sendLogJobBody: sendLogJobBody(mailService),
  };
}

export function createSendLogJob(loggerService: LoggerService, sendLogService: SendLogService, mailService: EmailService) {
  return {
    sendLogFailuresJob: sendLogFailuresJob(sendLogService, mailService),
    repeatRegister: repeatRegister(loggerService),
  };
}
