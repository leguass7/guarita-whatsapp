import { ConnectionOptions } from 'typeorm';

import { env } from './env';

export const dbType = process.env.DB_TYPE as 'mysql' | 'postgres';

export const dbConfig: ConnectionOptions & { host: string } = {
  type: dbType,
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_DATABASE,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
};

export const urlConnection = env.DB_URL;
