import { AppExpress } from './app/AppExpress';
import { httpPort, isDevMode, dbConfig, nodeEnv } from './config';
import { createDatabase } from './database';
import { logging } from './services/logger';

const appExpress = new AppExpress({ port: httpPort, env: nodeEnv });

async function startServer(): Promise<void> {
  const database = await createDatabase({
    ...dbConfig,
    synchronize: isDevMode,
    logging: ['error'],
    //logging: ['error', 'query'],
  });

  if (database?.isConnected) {
    logging('DATABASE CONNECTED: ', dbConfig.host);
    appExpress.listen();
  }
}

startServer();
