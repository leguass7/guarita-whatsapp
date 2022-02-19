import { createConnection, ConnectionOptions } from 'typeorm';

import { entities } from './entities';

export async function createDatabase(dbOptions: ConnectionOptions) {
  const conn = await createConnection({ ...dbOptions, entities });
  return conn;
}
