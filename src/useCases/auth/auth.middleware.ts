import type { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

import { HttpException } from '#/app/exceptions/HttpException';
import { jwtConfig } from '#/config';

import type { IPayloadToken } from './auth.dto';

export function requestHeaderToken(req: Request) {
  const { headers, body, query } = req;
  const token = headers?.authorization || headers['x-access-token'] || body?.token || query?.token;
  if (!token) return null;
  if (token.startsWith('Bearer ')) return token.slice(7, token.length);
  return token;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // console.log('req', req.path);

  // if (req.path === '/bull/monitor') return next();

  const token = requestHeaderToken(req);

  if (!token) {
    if (next) return next(new HttpException(403, 'Acesso restrito'));
    else throw new HttpException(403, 'Acesso restrito');
  }

  try {
    const auth = verify(token, jwtConfig.secret) as IPayloadToken;
    if (!auth && next) next(new HttpException(401, 'Token Inv\u00e1lido'));
    req.auth = auth;
    req.jwt = token;
    if (next) return next();
    return auth;
  } catch {
    return next(new HttpException(401, 'CATCH: Token Inv\u00e1lido'));
  }

  // if (!auth.exp && !hasAuthorizedToken(token)) {
  //   return res.stopHere(403, 1000, 'error', 'Token n\u00e3o autorizado');
  // }
}

/** Token payload */
export interface IAuth0Token {
  userId?: number;
  iss: string;
  sub: string;
  /**
   * urls: `['https://dev-evz8arch.us.auth0.com/api/v2/','https://dev-evz8arch.us.auth0.com/userinfo']`
   */
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  /** separado por espaços ex.: `openid profile email` */
  scope: string;
}
