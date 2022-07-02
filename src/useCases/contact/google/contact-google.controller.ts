import type { NextFunction, Request, Response } from 'express';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import type { GoogleService } from '#/useCases/google.service';

import type { ContactGoogleService } from './contact-google.service';

@Catch()
export class ContactGoogleController {
  constructor(private googleService: GoogleService, private contactGoogleService: ContactGoogleService) {}

  async googleAuthUrl(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const authUrl = this.googleService.getAuthUrl();
    return res.status(200).send({ success: true, authUrl }).end();
  }

  async googleSync(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const contacts = await this.contactGoogleService.syncContacts();

    return res.status(200).send({ success: true, contacts }).end();
  }

  async google(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const contacts = await this.contactGoogleService.paginateContacts();

    return res.status(200).send({ success: true, contacts }).end();
  }
}
