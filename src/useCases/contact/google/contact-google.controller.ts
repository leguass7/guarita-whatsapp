import type { NextFunction, Request, Response } from 'express';

import type { GoogleService } from '#/services/google.service';

export class ContactGoogleController {
  constructor(private googleService: GoogleService) {}

  async code(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const { query } = req;
    const code = query?.code as string;
    return res.status(200).send({ success: true, code }).end();
  }

  async google(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const contacts = await this.googleService.getContacts();

    return res.status(200).send({ success: true, contacts }).end();
  }
}
