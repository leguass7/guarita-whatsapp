import { ApiResult } from 'maxbotjs';

export class MaxbotException extends TypeError {
  message: string;
  response?: ApiResult & Record<string, any>;
  constructor(message: string, response: ApiResult & Record<string, any>) {
    super();
    this.message = message;
    this.response = response || null;
  }
}
