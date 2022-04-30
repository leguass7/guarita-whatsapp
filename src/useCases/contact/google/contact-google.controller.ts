import type { NextFunction, Request, Response } from 'express';

export class ContactGoogleController {
  async google(req: Request, res: Response, _next: NextFunction): Promise<any> {
    return res.status(200).send({ success: true }).end();
  }
}
