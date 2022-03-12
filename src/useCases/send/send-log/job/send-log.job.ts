import { format } from 'date-fns';

import { MailService } from '#/services/EmailService';
import { IJob } from '#/services/QueueService';

import { SendLogService } from '../send-log.service';
import { buildMailBody } from './send-log.html';

export type SendLogJobNames = 'SendFailures';

export type SendLogPayload = {
  startedIn?: Date;
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

      const mailService = new MailService('smtp');
      const sent = await mailService.send({
        from: 'Webmaster Avatar <webmaster@avatarsolucoesdigitais.com.br>',
        to: 'Leandro Sbrissa <leandro.sbrissa@hotmail.com>, Joaquim <dev@avatarsolucoesdigitais.com.br>',
        subject: `Falhas de envio dia ${txtDate}`,
        html: buildMailBody({ date, successLength, failedList, tryingLength }),
      });

      return sent;
    },
  };
}
