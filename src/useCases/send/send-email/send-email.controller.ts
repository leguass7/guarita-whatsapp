import type { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';

import type { SendEmailDto } from './send-email.dto';
import type { SendEmailService } from './send-email.service';

@Catch()
export class SendEmailController {
  constructor(private readonly sendEmailService: SendEmailService) {}

  async general(req: Request, res: Response, _next: NextFunction) {
    const { email, subject, text } = req.body as SendEmailDto;
    const response = await this.sendEmailService.sendGeneral({ email, subject, text });
    return res
      .status(200)
      .send({ success: true, ...response })
      .end();
  }

  async sendgrid(req: Request, res: Response, _next: NextFunction) {
    const { email, subject, text } = req.body as SendEmailDto;
    const response = await this.sendEmailService.sendGeneralSg({ email, subject, text });
    // const response = await this.sg.send({ to: email, subject, from: 'atendimento01@dessistemas.com.br', html: text });

    return res
      .status(200)
      .send({ success: true, ...response })
      .end();
  }
}
