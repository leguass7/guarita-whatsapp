import { NextFunction, Request, Response } from 'express';

import { MaxbotService } from '#/services/MaxbotService/index.ts';

import { ContactService } from './contact.service';

export class ContactController {
  constructor(private contactService: ContactService, private maxbotService: MaxbotService) {}

  async create(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const { body } = req;

    const contact = await this.contactService.create(body);
    return res.status(200).send({ success: true, contact }).end();
  }

  async update(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const { body, params } = req;
    const contactId = parseInt(params?.contactId);

    const contact = await this.contactService.update(contactId, body);
    return res.status(200).send({ success: true, contact }).end();
  }

  async list(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const { query, auth } = req;
    this.maxbotService.setMe('token', auth.maxbotToken);
    const ready = await this.maxbotService.getStatus();

    return res.status(200).send({ success: true, query, ready }).end();
  }

  async google(req: Request, res: Response, _next: NextFunction): Promise<any> {
    return res.status(200).send({ success: true }).end();
  }
}
