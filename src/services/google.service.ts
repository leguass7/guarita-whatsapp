import { resolve } from 'path';

import { pathVolume } from '#/config';
import { GoogleService } from '#/services/GoogleService';

const googleService = new GoogleService({
  credentialsPath: resolve(pathVolume, 'google'),
});

export { googleService };
export type { GoogleService };
