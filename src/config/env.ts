import 'dotenv/config';
import { resolve } from 'path';

export const env = {
  MAXBOT_KEY: process.env.MAXBOT_KEY,
  WHATSAPP_TEST: process.env.WHATSAPP_TEST,
  //
  PORT: Number(process.env.PORT) || 3333,
  APP_SECRET: process.env.APP_SECRET,
  //
  DB_HOST: process.env.DB_HOST,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_TYPE: process.env.DB_TYPE as any,
  DB_PORT: Number(process.env.DB_PORT) || 5433,
  DB_URL: process.env.DB_URL, // mysql://user:password@host/database_name
  //
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  //
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: Number(process.env?.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env?.REDIS_PASSWORD || undefined,
};

export type NodeEnv = 'development' | 'production' | 'testing';

export const nodeEnv = (process.env.NODE_ENV || 'production') as NodeEnv;
export const isDevMode = !!(nodeEnv !== 'production');
export const httpPort = env.PORT;
export const rootDir = resolve(__dirname, '../..');
