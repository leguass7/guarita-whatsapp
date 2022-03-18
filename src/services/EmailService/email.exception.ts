export class EmailException extends TypeError {
  message: string;
  response?: Record<string, any>;
  constructor(message: string, response?: Record<string, any>) {
    super();
    this.message = message;
    this.response = response || null;
  }
}
