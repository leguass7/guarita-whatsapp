import { format } from 'date-fns';

import { IJob } from '#/services/QueueService';

import { SendLogService } from './send-log.service';

export type SendLogJobNames = 'SendFailure';

export type SendLogPayload = {
  teste?: string;
};

export function createSendLogJob(
  sendLogService: SendLogService,
): IJob<SendLogJobNames, SendLogPayload> {
  return {
    name: 'SendFailure',
    handle: async () => {
      const result = await sendLogService.findByDate(new Date(), false);
      console.log(result.length, format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
      // implementar envio de e-mail
      return true;
    },
  };
}
