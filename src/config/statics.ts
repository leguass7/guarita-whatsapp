import { join } from 'path';

import { rootDir } from './env';
export const pathVolume = join(rootDir, 'volumes');
export const pathStatic = join(pathVolume, 'assets');
export const routeStatic = '/assets';

export interface IUploadConfig {
  path: string;
  allowedMimes: string[];
  limits: { fileSize: number };
  route: string;
}

// Produtos
export const uploadImages: IUploadConfig = {
  // path: resolve(pathStatic, 'products', 'images'),
  path: join(pathStatic, 'images'),
  allowedMimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'],
  limits: { fileSize: 2 * 1024 * 1024 },
  route: `${routeStatic}/images`,
};
