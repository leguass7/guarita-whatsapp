import { SocketServerService } from '#/services/SocketServerService';

import { DeviceSocketRoute } from './device/device.socket';
import { loggerService } from './logger.service';

const socketServerService = new SocketServerService(loggerService);

socketServerService.use([DeviceSocketRoute]);

export { socketServerService };
