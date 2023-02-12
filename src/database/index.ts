import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

import { dbConfig } from '#/config/database';
// import { isDevMode } from '#/config/env';
import { DataSourceService } from '#/services/DataSourceService';

import { entities } from './entities';

const config: MysqlConnectionOptions = {
  ...dbConfig,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
};

export const dataSource = new DataSourceService({
  type: 'mysql',
  // charset: 'utf8mb4_unicode_ci',
  synchronize: false,
  // synchronize: true,
  // synchronize: false,
  entities,
  logging: ['error'],
  // logging: ['error', 'query'],
  ...config,

  //
});

/**
 * Para criar escravos de leitura
 * @see https://orkhan.gitbook.io/typeorm/docs/multiple-connections#replication
 * @see https://sequelize.org/master/manual/read-replication.html
 */
