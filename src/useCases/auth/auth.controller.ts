import { NextFunction, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';

import { IRequestAuthorize, IResponseAuthorize } from './auth.dto';
import { AuthService } from './auth.service';

@Catch()
export class AuthController {
  constructor(private authService: AuthService) {}

  async authorize(req: IRequestAuthorize, res: Response<IResponseAuthorize>, _next: NextFunction): Promise<any> {
    const { body, auth } = req;
    const { maxbotToken } = body;
    const token = await this.authService.generateToken({ maxbotToken });
    return res.status(200).send({ success: true, token, auth }).end();
  }
}
