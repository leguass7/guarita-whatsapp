import type { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import type { GoogleService } from '#/services/google.service';

@Catch()
export class ContactGoogleController {
  constructor(private googleService: GoogleService) {}

  async googleAuthUrl(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const authUrl = this.googleService.getAuthUrl();
    return res.status(200).send({ success: true, authUrl }).end();
  }

  async google(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const contacts = await this.googleService.getContacts();

    return res.status(200).send({ success: true, contacts }).end();
  }
}
