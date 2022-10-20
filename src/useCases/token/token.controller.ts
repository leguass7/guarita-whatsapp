import type { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';

import type { TokenService } from './token.service';

@Catch()
export class TokenController {
  constructor(private tokenService: TokenService) {}

  async list(req: Request, res: Response, _next: NextFunction) {
    const { auth } = req;
    const tokens = await this.tokenService.find({ maxbot: auth?.maxbotToken });
    return res.status(200).send({ success: true, tokens }).end();
  }
}
