import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

import { env } from './env';

export const dbType = process.env.DB_TYPE as 'mysql' | 'postgres';

export const dbConfig: MysqlConnectionOptions = {
  type: 'mysql',
  url: env.DB_URL,
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_DATABASE,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
};

export const urlConnection = env.DB_URL;

export function getDbConfig(master: boolean) {
  // const url = master ? env.DB_URL : env.DB_URL_SLAVE;
  // if (url) return { url };
  // return master ? masterConfig : slaveConfig;
  if (master) return { url: env.DB_URL };
  return { url: env.DB_URL };
}
