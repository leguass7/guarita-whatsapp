import { CelebrateError, isCelebrateError } from 'celebrate';
import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';

import { HttpException } from '#/app/exceptions/HttpException';
import { logError } from '#/services/logger';

import { ApiResponseErrorDto } from './response.dto';

type MiddleErrors =
  | HttpException
  | CelebrateError
  | Error
  | JsonWebTokenError
  | NotBeforeError
  | TokenExpiredError;
export function errorMiddleware(
  error: MiddleErrors,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const result: ApiResponseErrorDto = {
    status: 500,
    message: error?.message || 'Something went wrong ApiResponseErrorDto',
  };

  if (isCelebrateError(error)) {
    // console.error('\n', error?.stack || error);

    const messages = [];
    error.details.forEach(err => {
      err.details.forEach(msg => {
        // console.log('errorMiddleware isCelebrateError msg', msg); //eslint-disable-line no-console
        messages.push(msg.message);
      });
    });

    result.status = 400;
    result.message = messages.length > 1 ? messages : messages[0];
  }

  // if (error instanceof BaseError) {
  //   result.message = { message: `${error.name}: ${error.message}` };
  //   // trata erro do sequelize
  // }

  if (error instanceof HttpException) {
    result.status = error?.status || 500;
    result.message = error.message || 'Something went wrong HttpException';
  }

  if (
    error instanceof NotBeforeError ||
    error instanceof JsonWebTokenError ||
    error instanceof TokenExpiredError
  ) {
    result.status = 401;
    result.message = error.message || 'Token inválido';
  }

  logError(result?.status, result?.message);
  // console.error('\n', error?.stack, error);
  // console.log('Erro não identificado');

  return res
    .status(result?.status || 500)
    .send(result)
    .end();
}
