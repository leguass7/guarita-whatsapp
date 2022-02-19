import type { Request } from 'express';
import { verify, VerifyOptions } from 'jsonwebtoken';

import { jwtConfig } from '#/config';

import { IPayloadToken } from './auth.dto';

export function requestHeaderToken(req: Request) {
  const { headers, body, query } = req;
  const token = headers?.authorization || headers['x-access-token'] || body?.token || query?.token;
  if (!token) return null;
  if (token.startsWith('Bearer ')) return token.slice(7, token.length);
  return token;
}

export function decodeToken(token: string, options?: VerifyOptions): IPayloadToken {
  try {
    const data = verify(token, jwtConfig.secret, options);
    return data as IPayloadToken;
  } catch (_error) {
    return null;
  }
}

export function extractInfo(req: Request) {
  const { useragent, baseUrl, clientIp } = req;
  return {
    source: useragent && useragent.source,
    ip: clientIp,
    route: baseUrl || '/',
    currentRoute: req?.originalUrl || '/',
  };
}
