import { QueueOptions } from 'bull';

import { env, isDevMode } from './env';

export const redisConfig: QueueOptions['redis'] = {
  host: isDevMode ? 'localhost' : env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};

export const prefix = 'GUARITA_WHATSAPP';
