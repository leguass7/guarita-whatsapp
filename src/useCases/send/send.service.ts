import type { ISendTextResult } from 'maxbotjs/dist';

import { logging } from '#/services/logger';
import { LogClass } from '#/services/logger/log-decorator';

import { SendLogService } from './send-log/send-log.service';
import { SendMaxbotPayload, SendJobService } from './send-maxbot.job';

@LogClass
export class SendService {
  constructor(private maxbotJob: SendJobService, private sendLogService: SendLogService) {}

  async send(payload: SendMaxbotPayload) {
    const { token, to, text } = payload;

    const save = { type: 'maxbot', to, status: false, payload };

    const job = this.maxbotJob
      .onFailed('SendMaxbot', async (job, err: any) => {
        this.sendLogService.create({
          ...save,
          message: job?.failedReason,
          response: err?.response,
        });
      })
      .onSuccess('SendMaxbot', async (job, { msgId, msg }: ISendTextResult) => {
        logging('Mensagem enviada', to);
        this.sendLogService.create({ ...save, status: true, message: msg, messageId: msgId });
      })
      .add('SendMaxbot', { token, to, text });

    return job;
  }
}
