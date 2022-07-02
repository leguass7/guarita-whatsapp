import { join } from 'path';
import { Logger, createLogger, transports, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const isTesting = ['testing', 'test'].includes(process.env.NODE_ENV);
export interface LoggerServiceOptions {
  pathVolume: string;
  appName: string;
  appVersion: string;
}

export class LoggerService {
  public filelogger: Logger;
  public logger: Logger;
  public loggerJobs: Logger;

  constructor({ pathVolume, appName, appVersion }: LoggerServiceOptions) {
    const transportDaily: DailyRotateFile = new DailyRotateFile({
      dirname: join(pathVolume, 'logs'),
      filename: `${appName}-${appVersion}-%DATE%.log`,
      auditFile: join(pathVolume, 'logs', 'winston-daily-rotate-config-audit.json'),
      datePattern: 'YYYY-MM-DD',
      // frequency: '1d',
      zippedArchive: true,
      maxSize: '2m',
      maxFiles: '1d',
    });

    const jobsErrors: DailyRotateFile.DailyRotateFileTransportOptions = {
      auditFile: join(pathVolume, 'logs', 'error-jobs-config-audit.json'),
      datePattern: 'YYYY-MM-DD',
      dirname: join(pathVolume, 'logs'),
      filename: `${appName}-${appVersion}-JOBS.log`,
      zippedArchive: true,
      frequency: '1d',
      maxSize: '1m',
      maxFiles: '7d',
    };

    this.logger = createLogger({
      exitOnError: false,
      format: format.combine(format.colorize({ all: true, colors }), format.simple()),
      transports: [new transports.Console()],
      levels,
    });

    this.filelogger = createLogger({
      exitOnError: false,
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss' }),
        customFormat,
        //
      ),
      transports: [transportDaily],
      levels,
    });

    this.loggerJobs = createLogger({
      exitOnError: false,
      format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
      transports: [new DailyRotateFile(jobsErrors), new transports.Console()],
      level: 'error',
      // levels,
    });
  }

  logging(...args: any[]) {
    if (!isTesting) {
      this.logger.info(args.join(' '));
      this.filelogger.info(args.join(' '));
    }
  }

  logError(...args: any[]) {
    this.logger.error(args.join(' '));
    this.filelogger.error(args.join(' '));
  }

  logWarn(...args: any[]) {
    this.logger.warn(args.join(' '));
    this.filelogger.warn(args.join(' '));
  }
}

export const DevLogger = createLogger({
  exitOnError: false,
  format: format.combine(format.colorize({ all: true, colors }), format.timestamp({ format: 'YYYY-MM-dd HH:mm:ss' }), customFormat),
  transports: [new transports.Console()],
  levels,
});

export function logDev(...args: any[]) {
  if (!isTesting) DevLogger.info(args.join(' '));
  // return isDevMode && Logger.info(args.join(' '));
}
