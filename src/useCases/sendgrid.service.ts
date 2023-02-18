import { EmailService } from '#/services/EmailService';

import { loggerService } from './logger.service';

export const sendgridService = new EmailService('sendgrid', loggerService);
