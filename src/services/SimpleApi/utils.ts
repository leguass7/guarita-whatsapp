import { AxiosError, AxiosResponse } from 'axios';
import camelcaseKeys from 'camelcase-keys';

import { ResponseApi } from './types';

export function responseDto(res: AxiosResponse): AxiosResponse {
  const axiosData = res && res?.data;
  if (res?.config?.responseType === 'blob') {
    return res;
  }

  const data: ResponseApi<any> = {
    ...axiosData,
    success: !!(res?.status < 400),
    ...camelcaseKeys(axiosData, { deep: true }),
  };

  return { ...res, data };
}

export function responseError() {
  return (error?: AxiosError<any>) => {
    const response = error && error?.response;
    const message = error?.response?.data?.message;

    let errorMessage = message;
    if (!errorMessage) errorMessage = error ? `${error.code || error.message}` : 'TIMEOUT';

    if (error?.code) {
      errorMessage = ['ECONNABORTED'].includes(error?.code) ? 'Aplicativo Offline' : errorMessage;
    }

    const data: any = { success: false, message: errorMessage };
    if (!response) return Promise.resolve({ data });

    if (Array.isArray(errorMessage)) {
      // let count = 200;

      errorMessage.forEach(message => {
        // eslint-disable-next-line no-console
        console.log('message', message);
        // toast?.(message, { type: 'error', delay: count, autoClose: 3000 });
        // count += 200;
      });
    } else {
      // eslint-disable-next-line no-console
      console.log('errorMessage', errorMessage);
    }

    return Promise.resolve(response);
  };
}
