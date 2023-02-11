import { appName } from '#/config';

import { SimpleApi } from '../SimpleApi';

export const api = new SimpleApi(appName, null, { disableIncFetch: true, baseURL: 'https://linear.avatarsolucoesdigitais.com.br/guarita-whatsapp' });
