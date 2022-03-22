import { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';

import { SendEmailDto } from './send-email.dto';
import type { SendEmailService } from './send-email.service';

@Catch()
export class SendEmailController {
  constructor(private sendEmailService: SendEmailService) {}

  async general(req: Request, res: Response, _next: NextFunction) {
    const { email, subject, text } = req.body as SendEmailDto;
    const response = await this.sendEmailService.sendGeneral({ email, subject, text });
    return res
      .status(200)
      .send({ success: true, ...response })
      .end();
  }
}
