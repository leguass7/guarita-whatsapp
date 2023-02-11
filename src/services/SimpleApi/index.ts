import Axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import type { ApiConfig, IApiStorageData, ResponseApi } from './types';
import { responseDto, responseError } from './utils';

export class SimpleApi {
  public fetchId: number;
  public readonly api: AxiosInstance;
  private readonly disableIncFetch: boolean;
  private readonly enableRefreshToken: boolean;

  constructor(public readonly appName: string, public store?: any, config: ApiConfig = {}) {
    const { enableRefreshToken, disableIncFetch, ...options } = config;

    this.api = Axios.create(options);
    this.enableRefreshToken = !!enableRefreshToken;
    this.disableIncFetch = !!disableIncFetch;

    this.fetchId = 0;

    this.setInterceptorRequest();
    this.setInterceptorResponse();
  }

  private setInterceptorRequest(): void {
    this.api.interceptors.request.use(config => {
      const token = this.getApiStorageData()?.token;
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
      // console.log('REQUEST', `${config.baseURL}`, `${config.url}`);
      // if (config?.data) config.data = decamelcase(config.data);
      return config;
    });
  }

  /**
   * Removido implementação de refresh token
   */
  private setInterceptorResponse() {
    this.api.interceptors.response.use(responseDto, responseError());
  }

  private normalizeUrl(path?: string): string {
    const [base = '', query = ''] = `${path}`.split('?');
    const params = new URLSearchParams(query);

    params.set('fetchId', `${this.fetchId}`);
    if (this?.disableIncFetch) params.delete('fetchId');

    const q = new URLSearchParams(params);
    const hasProperties = !!Array.from(q.keys()).length;

    const result = [base.replace(/^(.*)\/$/, '$1'), hasProperties ? q.toString() : ''].filter(f => !!f);

    return result.length > 1 ? result.join('?') : result[0];
  }

  private getApiStorageData(): IApiStorageData {
    const state = this?.store?.getState?.();

    return {
      token: state?.token || '',
      refreshToken: state?.refreshToken || '',
    };
  }

  async getDefault<T = any>(path?: string, config?: AxiosRequestConfig): Promise<ResponseApi<T>> {
    // this.fetchId += 1;
    const url = this.normalizeUrl(path);
    const response = await this.api.get(url, config);
    return response && response.data;
  }

  async postDefault<T = any, P = any>(path: string, payload: P, config?: AxiosRequestConfig): Promise<ResponseApi<T>> {
    // this.fetchId += 1;
    const url = this.normalizeUrl(path);
    const response = await this.api.post(url, payload, config);

    return response && response.data;
  }

  async putDefault<T = any, P = any>(path: string, payload: P, config?: AxiosRequestConfig): Promise<ResponseApi<T>> {
    // this.fetchId += 1;
    const url = this.normalizeUrl(path);
    const response = await this.api.put(url, payload, config);

    return response && response.data && response.data;
  }

  async patchDefault<T = any, P = any>(path: string, payload: P, config?: AxiosRequestConfig): Promise<ResponseApi<T>> {
    // this.fetchId += 1;
    const url = this.normalizeUrl(path);
    const response = await this.api.patch(url, payload, config);
    return response && response.data;
  }

  async deleteDefault<T = any>(path: string, config?: AxiosRequestConfig): Promise<ResponseApi<T>> {
    // this.fetchId += 1;
    const url = this.normalizeUrl(path);
    const response = await this.api.delete(url, config);
    return response && response.data;
  }
}

export * from './types';
