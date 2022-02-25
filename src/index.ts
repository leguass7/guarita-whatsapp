import { AppExpress } from './app/AppExpress';
import { httpPort, isDevMode, dbConfig, nodeEnv } from './config';
import { createDatabase } from './database';
import { logging } from './services/logger';

const appExpress = new AppExpress({ port: httpPort, env: nodeEnv });

export async function startServer() {
  const database = await createDatabase({
    ...dbConfig,
    synchronize: false, //isDevMode,
    logging: ['error'],
    //logging: ['error', 'query'],
  });

  if (database?.isConnected) {
    logging('DATABASE CONNECTED: ', dbConfig.host);
    return appExpress.listen();
  }
  return null;
}

if (nodeEnv !== 'testing') startServer();
