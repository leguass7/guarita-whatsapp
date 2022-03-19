import { Router } from 'express';

import { EmailAssetsController } from './email-assets.controller';
import { EmailSentService } from './email-sent/email-sent.service';

const emailSentService = new EmailSentService();
const assetsController = new EmailAssetsController(emailSentService);
const EmailRoute = Router();

EmailRoute.get('/assets/:imageName', (req, res, next) => assetsController.sendFile(req, res, next));

export { EmailRoute, emailSentService };
