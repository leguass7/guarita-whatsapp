import { Router } from 'express';

import { googleService } from '#/services/google.service';

import { ContactGoogleController } from './contact-google.controller';

const controller = new ContactGoogleController(googleService);

const ContactGoogleRoute = Router();

ContactGoogleRoute.get('/auth-url', (req, res, next) => controller.googleAuthUrl(req, res, next));
ContactGoogleRoute.get('/', (req, res, next) => controller.google(req, res, next));

export { ContactGoogleRoute };
