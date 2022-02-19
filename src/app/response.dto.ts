import { Response } from 'express';

export interface ApiResponseErrorDto {
  status?: number;
  message: string | string[];
}

export interface AppResponse<T = any> extends Response {
  data: T;
}

export interface IResposeApi {
  success?: boolean;
}
