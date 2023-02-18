import { AppExpress } from './app/AppExpress';
import { httpPort, nodeEnv } from './config';
import { dataSource } from './database';
import { queues } from './useCases/index.job';
import { loggerService } from './useCases/logger.service';
import { socketServerService } from './useCases/socket.service';

const serverHttp = new AppExpress({ port: httpPort, env: nodeEnv }, socketServerService, loggerService, queues);

export async function startServer() {
  await dataSource.initialize();

  const closeServer = async () => {
    if (dataSource?.isInitialized) dataSource?.destroy();
    await serverHttp.close();
    serverHttp.express = null;
  };

  if (dataSource?.isInitialized) {
    const conn = dataSource.getConnectionOptions();
    loggerService.logging('DATABASE CONNECTED: ', conn?.master?.host, conn?.master?.database);
    return {
      serverHttp,
      server: await serverHttp.listen(),
      closeServer,
    };
  }
  return null;
}

if (nodeEnv !== 'testing') startServer();
