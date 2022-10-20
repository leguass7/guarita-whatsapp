import { dbConfig } from '#/config/database';
import { isDevMode } from '#/config/env';
import { DataSourceService } from '#/services/DataSourceService';

import { entities } from './entities';

export const dataSource = new DataSourceService({
  type: 'mysql',
  // charset: 'utf8mb4_unicode_ci',
  synchronize: !!isDevMode,
  // synchronize: true,
  // synchronize: false,
  entities,
  ...dbConfig,
  logging: ['error'],
  // logging: ['error', 'query'],

  //
});

/**
 * Para criar escravos de leitura
 * @see https://orkhan.gitbook.io/typeorm/docs/multiple-connections#replication
 * @see https://sequelize.org/master/manual/read-replication.html
 */
