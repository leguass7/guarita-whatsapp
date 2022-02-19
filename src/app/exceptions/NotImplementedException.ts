import { HttpException } from './HttpException';

export class NotImplementedException extends HttpException {
  constructor(message = 'feature not implemented') {
    super(501, message);
  }
}
