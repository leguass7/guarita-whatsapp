import type { NextFunction, Request, Response } from 'express';

import { RequestSendSocketTextDto } from './send-socket.dto';
import type { SendSocketService } from './send-socket.service';

export class SendSocketController {
  constructor(private sendSocketService: SendSocketService) {}

  async sendMessage(req: Request, res: Response, _next: NextFunction) {
    const { to, text } = req.body as RequestSendSocketTextDto;
    const response = await this.sendSocketService.sendText({ to, text });
    return res
      .status(200)
      .send({ success: true, ...response })
      .end();
  }
}
