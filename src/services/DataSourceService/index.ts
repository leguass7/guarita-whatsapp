import { DataSource, DataSourceOptions } from 'typeorm';
import type { MysqlConnectionCredentialsOptions } from 'typeorm/driver/mysql/MysqlConnectionCredentialsOptions';

import { LogClass } from '../LoggerService/log-class.decorator';

function parsedbUrl(url = ''): MysqlConnectionCredentialsOptions {
  if (!url) return null;
  const [, url1] = url.split('://');
  const [url2, database] = url1.split('/');
  const [auth, server] = url2.split('@');
  const [[username, password], [host, port]] = [auth.split(':'), server.split(':')];

  return { database, username, password, host, port: Number(port) };
}

@LogClass
export class DataSourceService extends DataSource {
  constructor(dbOptions: DataSourceOptions) {
    super(dbOptions);
    // eslint-disable-next-line no-console
    console.log(dbOptions);
  }

  // FIXME: melhorar tratamento de erros
  getConnectionOptions() {
    const getReplication = (o: any) => {
      if (o?.replication) {
        return {
          master: o?.replication?.master as MysqlConnectionCredentialsOptions,
          slave: o?.replication?.slaves as MysqlConnectionCredentialsOptions[],
        };
      }
      return {
        master: {
          url: o?.url,
          database: o?.database,
          username: o?.username,
          password: o?.password,
          host: o?.host,
          port: o?.port,
        },
        slave: [],
      };
    };
    const replication = getReplication(this.options);
    const master = replication.master?.url ? parsedbUrl(replication.master?.url) : replication.master;
    const [slave] = replication.slave.map(s => {
      return s?.url ? parsedbUrl(s.url) : s;
    });

    return { master, slave };
  }
}
