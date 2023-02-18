import type { Queue } from 'bull';

import type { LoggerService } from '#/services/LoggerService';

type ConnectionOptions = {
  maxRetries?: number;
  interval?: number;
};

type ResolverParams = {
  success: boolean;
  retries: number;
  message?: string;
};

type Resolver = (params: ResolverParams) => void;

export function tryRedisConnection(
  redis: Queue['client'],
  { maxRetries = 3, interval = 2000 }: ConnectionOptions = {},
  loggerService?: LoggerService,
) {
  let retries = 0;

  const checkConnection = (resolver: Resolver) => {
    if (redis?.status === 'ready') {
      loggerService?.logging?.(`REDIS CONNECTED`, redis?.options?.host);
      return resolver({ success: true, retries });
    }

    if (redis?.status !== 'connecting') {
      retries++;
      loggerService?.logError?.(`Failed to connect to redis host '${redis?.options?.host}', attempts: ${retries}`);
    }

    setTimeout(() => {
      if (retries >= maxRetries) {
        return resolver({ success: false, retries, message: 'REDIS: Exceeded connection attempts' });
      } else return checkConnection(resolver);
    }, interval);
  };

  return new Promise<ResolverParams>(resolve => checkConnection(resolve));
}
