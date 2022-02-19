import { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';

import { SendService } from './send.service';

@Catch()
export class SendController {
  constructor(private sendService: SendService) {}

  async sendMessage(req: Request, res: Response, _next: NextFunction) {
    const { auth, body } = req;
    await this.sendService.send({ ...body, token: auth.maxbotToken });
    return res.status(200).send({ success: true }).end();
  }
}
