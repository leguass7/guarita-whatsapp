import { Router } from 'express';

import { MaxbotService } from '#/services/MaxbotService/index.ts';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { postContactSchema, patchContactSchema } from './contact.validation';

const maxbotService = new MaxbotService();
const contactService = new ContactService();
const controller = new ContactController(contactService, maxbotService);

const ContactRoute = Router();

ContactRoute.get('/google', (req, res, next) => controller.google(req, res, next));
ContactRoute.get('/', (req, res, next) => controller.list(req, res, next));
ContactRoute.post('/', postContactSchema, (req, res, next) => controller.create(req, res, next));
ContactRoute.patch('/', patchContactSchema, (req, res, next) => controller.update(req, res, next));

export { ContactRoute };
