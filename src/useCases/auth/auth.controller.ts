import { NextFunction, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import type { GoogleService } from '#/useCases/google.service';

import { IRequestAuthorize, IResponseAuthorize } from './auth.dto';
import { AuthService } from './auth.service';

@Catch()
export class AuthController {
  constructor(private authService: AuthService, private googleService: GoogleService) {}

  async googleCode(req: IRequestAuthorize, res: Response, _next: NextFunction): Promise<any> {
    const { query } = req;
    const code = query?.code as string;
    const { status, tokens } = await this.googleService.authorizeByCode(code);
    return res.status(status).send({ success: true, code, tokens }).end();
  }

  async authorize(req: IRequestAuthorize, res: Response<IResponseAuthorize>, _next: NextFunction): Promise<any> {
    const { body, auth } = req;
    const { maxbotToken } = body;
    const token = await this.authService.generateToken({ maxbotToken });
    return res.status(200).send({ success: true, token, auth }).end();
  }
}
