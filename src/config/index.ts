import { appName, appVersion } from './app';
export { isDevMode, httpPort, rootDir, nodeEnv, env } from './env';
export { jwtConfig } from './auth';
export { dbConfig, dbType } from './database';

export { smtpConfig, sendgridConfig } from './mail';
export { pathStatic, pathVolume, routeStatic, uploadImages } from './statics';

//
export const projectName = appName;
export const projectVersion = appVersion;
