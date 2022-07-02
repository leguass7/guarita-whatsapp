import { AppExpress } from './app/AppExpress';
import { httpPort, isDevMode, dbConfig, nodeEnv } from './config';
import { createDatabase } from './database';
import { loggerService } from './useCases/logger.service';
import { socketServerService } from './useCases/socket.service';

const serverHttp = new AppExpress({ port: httpPort, env: nodeEnv }, socketServerService, loggerService);

export async function startServer() {
  const database = await createDatabase({
    ...dbConfig,
    synchronize: !!isDevMode,
    logging: ['error'],
    // logging: ['error', 'query'],
  });

  const closeServer = async () => {
    if (database?.isConnected) database?.close();
    await serverHttp.close();
    serverHttp.express = null;
  };

  if (database?.isConnected) {
    loggerService.logging('DATABASE CONNECTED: ', dbConfig.host);
    return {
      serverHttp,
      server: await serverHttp.listen(),
      closeServer,
    };
  }
  return null;
}

if (nodeEnv !== 'testing') startServer();
