import { QueueOptions } from 'bull';

import { env, isDevMode } from './env';

export const redisConfig: QueueOptions['redis'] = {
  host: env?.REDIS_HOST || 'localhost',
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};

export const prefix = `${isDevMode ? 'DEV_' : ''}GUARITA_WHATSAPP`;
