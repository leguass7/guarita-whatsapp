import { ApiResult } from 'maxbotjs';

export class MaxbotException extends TypeError {
  message: string;
  response?: ApiResult;
  constructor(message: string, response: ApiResult) {
    super();
    this.message = message;
    this.response = response || null;
  }
}
