import { Router } from 'express';

import { ContactGoogleController } from './contact-google.controller';

const controller = new ContactGoogleController();

const ContactGoogleRoute = Router();

ContactGoogleRoute.get('/', (req, res, next) => controller.google(req, res, next));

export { ContactGoogleRoute };
