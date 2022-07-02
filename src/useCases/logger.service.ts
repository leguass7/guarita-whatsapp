import { appName, appVersion, pathVolume } from '#/config';
import { LoggerService } from '#/services/LoggerService';

export const loggerService = new LoggerService({ appName, appVersion, pathVolume });
