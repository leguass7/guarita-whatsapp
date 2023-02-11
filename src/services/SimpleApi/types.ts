import type { AxiosRequestConfig } from 'axios';

export type ResponseApi<T = any> = T & {
  success?: boolean;
  message?: string | string[];
};

export type ApiConfig = AxiosRequestConfig & {
  enableRefreshToken?: boolean;
  disableIncFetch?: boolean;
};

export type IApiStorageData = {
  readonly token: string;
  readonly refreshToken: string;
};

export interface IResponseRefreshToken extends ResponseApi {
  token?: string;
  refreshToken?: string;
}
