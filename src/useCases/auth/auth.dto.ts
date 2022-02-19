import { Request } from 'express';

import { IResposeApi } from '#/app/response.dto';

export interface IPayloadToken extends Record<string, any> {
  maxbotToken?: string;
}
export interface IAuthPayloadDto {
  email: string;
  password: string;
}

export interface IRequestAuthorize extends Request {
  body: IPayloadToken;
}

export interface IResponseAuthorize extends IResposeApi {
  token: string;
  auth?: IPayloadToken;
}
