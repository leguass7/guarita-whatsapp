import { format } from 'date-fns';
import { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import { HttpException } from '#/app/exceptions/HttpException';
import { tryDate } from '#/helpers/date';

import type { SendLogService } from './send-log.service';

@Catch()
export class SendLogController {
  constructor(private sendLogService: SendLogService) {}

  async now(req: Request, res: Response, _next: NextFunction) {
    const date = tryDate(req?.query?.date as string) || new Date();
    // por alguma razão o date-fns está diminuindo 1 dia aqui
    // console.log('date', date, format(date, 'yyyy-MM-dd'));
    const job = await this.sendLogService.sendBody(date);
    if (!job) throw new HttpException(500, 'Erro ao agendar envio');
    return res
      .status(200)
      .send({ success: true, date: format(date, 'yyyy-MM-dd'), jobId: job?.id })
      .end();
  }
}
