import { Request } from 'express';

export interface ISendMessagePayload {
  provider: 'maxbot' | 'sacdigital';
  type: 'text' | 'image';
  to: string;
  message: string;
}

export interface RequestSendMessageDto extends Request {
  body: ISendMessagePayload;
}
