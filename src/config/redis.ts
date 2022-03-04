import type { RedisOptions } from 'ioredis';

import { env, isDevMode } from './env';

export const redisConfig: RedisOptions = {
  host: isDevMode ? '207.246.64.19' : env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};

export const redisUri = `redis://${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`;
