import { Router } from 'express';

import { baseEmailAssets } from '#/config';
import { dataSource } from '#/database';

import { EmailAssetsController } from './email-assets.controller';
import { EmailSentService } from './email-sent/email-sent.service';

const emailSentService = new EmailSentService(dataSource);
const assetsController = new EmailAssetsController(emailSentService);
const EmailRoute = Router();

EmailRoute.get(`${baseEmailAssets.route}/:imageName`, (req, res, next) => assetsController.sendFile(req, res, next));

export { EmailRoute, emailSentService };
