import { Router } from 'express';

import { dataSource } from '#/database';
import { MaxbotService } from '#/services/MaxbotService/index.ts';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { postContactSchema, patchContactSchema } from './contact.validation';
import { ContactGoogleRoute } from './google/contact-google.route';

const maxbotService = new MaxbotService();
const contactService = new ContactService(dataSource);
const controller = new ContactController(contactService, maxbotService);

const ContactRoute = Router();

ContactRoute.use('/google', ContactGoogleRoute);
ContactRoute.get('/', (req, res, next) => controller.list(req, res, next));
ContactRoute.post('/', postContactSchema, (req, res, next) => controller.create(req, res, next));
ContactRoute.patch('/', patchContactSchema, (req, res, next) => controller.update(req, res, next));

export { ContactRoute, contactService };
