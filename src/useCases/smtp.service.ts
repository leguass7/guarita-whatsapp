import { EmailService } from '#/services/EmailService';

import { loggerService } from './logger.service';

export const smtpService = new EmailService('smtp', loggerService);
