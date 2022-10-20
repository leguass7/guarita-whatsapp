import { SimpleApi } from '@severoemanuel/simple-api';

import { appName } from '#/config';

export const api = new SimpleApi(appName, null, { disableIncFetch: true, baseURL: 'https://linear.avatarsolucoesdigitais.com.br/guarita-whatsapp' });
