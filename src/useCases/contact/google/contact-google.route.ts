import { Router } from 'express';

import { googleService } from '#/useCases/google.service';

import { ContactGoogleController } from './contact-google.controller';
import { ContactGoogleService } from './contact-google.service';

const contactGoogleService = new ContactGoogleService(googleService);
const controller = new ContactGoogleController(googleService, contactGoogleService);

const ContactGoogleRoute = Router();

ContactGoogleRoute.get('/auth-url', (req, res, next) => controller.googleAuthUrl(req, res, next));
ContactGoogleRoute.get('/sync', (req, res, next) => controller.googleSync(req, res, next));
ContactGoogleRoute.get('/', (req, res, next) => controller.google(req, res, next));

export { ContactGoogleRoute };
