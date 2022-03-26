import { Request } from 'express';

export interface MessageMetadata {
  email?: string;
  userId?: number | string;
  userName?: string;
  companyName?: string;
  forbiddenEmail?: boolean;
  makeType?: 'fail' | 'ok';
}

export interface ISendMessagePayload {
  provider: 'maxbot' | 'sacdigital';
  type: 'text' | 'image';
  to: string;
  message: string;
  metaData?: MessageMetadata;
}

export interface RequestSendMessageDto extends Request {
  body: ISendMessagePayload;
}
