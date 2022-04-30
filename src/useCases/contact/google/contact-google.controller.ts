import type { NextFunction, Request, Response } from 'express';

import type { GoogleService } from '#/services/google.service';

export class ContactGoogleController {
  constructor(private googleService: GoogleService) {}

  async google(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const contacts = await this.googleService.getContacts();

    return res.status(200).send({ success: true, contacts }).end();
  }
}
