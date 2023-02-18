import type { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import { HttpException } from '#/app/exceptions/HttpException';
import { loggerService } from '#/useCases/logger.service';
import type { SendEmailService } from '#/useCases/send/send-email/send-email.service';

import { RequestSendSocketTextDto } from './send-socket.dto';
import type { SendSocketService } from './send-socket.service';

@Catch()
export class SendSocketController {
  constructor(private readonly sendSocketService: SendSocketService, private readonly sendEmailService: SendEmailService) {}

  async sendMessage(req: Request, res: Response, _next: NextFunction) {
    const { to, text, metaData } = req.body as RequestSendSocketTextDto;
    loggerService.logging('sendMessage metaData', metaData?.userName, metaData?.email);
    const response = await this.sendSocketService.sendScheduledText({ to, text });

    let mailer: any = null;
    if (metaData?.email) {
      mailer = await this.sendEmailService.sendGeneralSg({ email: metaData?.email, text, subject: 'Módulo Guarita' });
    } else if (!response) {
      throw new HttpException(503, `service_unavailable`);
    }

    return res
      .status(200)
      .send({ success: true, ...response, mailer })
      .end();
  }

  async sendText(req: Request, res: Response, _next: NextFunction) {
    const { to, text, metaData } = req.body as RequestSendSocketTextDto;
    const response = await this.sendSocketService.sendText({ to, text });

    let mailer: any = null;
    if (metaData?.email) {
      mailer = await this.sendEmailService.sendGeneralSg({ email: metaData?.email, text, subject: 'Módulo Guarita' });
    }

    return res
      .status(200)
      .send({ success: true, ...response, mailer })
      .end();
  }

  async getStatus(req: Request, res: Response, _next: NextFunction) {
    const response = await this.sendSocketService.getStatus();
    return res
      .status(200)
      .send({ success: true, ...response })
      .end();
  }
}
