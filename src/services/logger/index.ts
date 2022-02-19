import { format as formatDate, isValid, parseISO } from 'date-fns';
import { join } from 'path';
import { createLogger, transports, format, addColors } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { isDevMode, pathVolume, projectName, projectVersion } from '#/config';

const myFormat = format.printf(({ level, message, timestamp }) => {
  const lv = level.toUpperCase() || '';
  const d = parseISO(timestamp);
  const date = isValid(d) ? formatDate(d, 'yyyy-MM-dd HH:mm:ss') : timestamp;
  return `${date} ${lv}: ${message}`;
});

//see more abour log Rotate at
//https://medium.com/@akshaypawar911/how-to-use-winston-daily-rotate-file-logger-in-nodejs-1e1996d2d38
const daillyRotateOpts = {
  dirname: join(pathVolume, 'logs'),
  filename: `${projectName}-${projectVersion}-%DATE%.log`,
  auditFile: join(pathVolume, 'logs', 'winston-daily-rotate-config-audit.json'),
  datePattern: 'YYYY-MM-DD',
  frequency: '1d',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '15d',
};

const jobsErrors: DailyRotateFile.DailyRotateFileTransportOptions = {
  auditFile: join(pathVolume, 'logs', 'error-config-audit.json'),
  datePattern: 'YYYY-MM-DD',
  dirname: join(pathVolume, 'logs'),
  filename: `${projectName}-${projectVersion}-JOBS.log`,
  frequency: '1d',
  maxSize: '20m',
  maxFiles: '15d',
};

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

addColors({ error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' });

export const Logger = createLogger({
  exitOnError: false,
  format: format.combine(format.timestamp(), myFormat),
  transports: [new DailyRotateFile(daillyRotateOpts), new transports.Console()],
  levels,
});

export function logging(...args: any[]) {
  return Logger.info(args.join(' '));
}

export function logError(...args: any[]) {
  return Logger.error('logError', args.join(' '));
}

export function logDev(...args: any[]) {
  return isDevMode && Logger.info(args.join(' '));
}

export function logWarn(...args: any[]) {
  return Logger.warn(args.join(' '));
}

export const LoggerJobs = createLogger({
  exitOnError: false,
  format: format.combine(format.timestamp(), myFormat),
  transports: [new DailyRotateFile(jobsErrors), new transports.Console()],
  level: 'error',
});
