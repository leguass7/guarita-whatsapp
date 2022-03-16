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
    const day = tryDate(req?.query?.day as string) || new Date();

    // console.log('\ndate', day, format(day, 'yyyy-MM-dd'), '\n');
    const job = await this.sendLogService.sendBody(day);
    if (!job) throw new HttpException(500, 'Erro ao agendar envio');
    return res
      .status(200)
      .send({ success: true, date: format(day, 'yyyy-MM-dd'), jobId: job?.id })
      .end();
  }
}
