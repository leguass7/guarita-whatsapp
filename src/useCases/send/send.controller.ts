import { NextFunction, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import { HttpException } from '#/app/exceptions/HttpException';

import { SendMaxbotPayload } from './send-maxbot.job';
import { RequestSendMessageDto } from './send.dto';
import { SendService } from './send.service';

@Catch()
export class SendController {
  constructor(private sendService: SendService) {}

  async sendMessage(req: RequestSendMessageDto, res: Response, _next: NextFunction) {
    const { auth, body } = req;
    const { message, provider, type, to, metaData } = body;

    if (provider !== 'maxbot') throw new HttpException(503, 'Não implementado');

    let job = null;
    const payload: SendMaxbotPayload = { token: auth.maxbotToken, to };
    if (type === 'text') {
      payload.text = message;
      job = await this.sendService.sendMaxbotText(payload, { ...metaData });
    } else if (type === 'image') {
      payload.url = message;
      job = await this.sendService.sendMaxbotImage(payload);
    }

    return res.status(200).send({ success: true, jobId: job?.id }).end();
  }
}
