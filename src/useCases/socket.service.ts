import { SocketServerService } from '#/services/SocketServerService';
import { SocketDeviceRoute } from '#socket/device/device.socket';

import { SocketStatusRoute } from './_socket/status/status.socket';
import { loggerService } from './logger.service';

const socketServerService = new SocketServerService(loggerService);

socketServerService.use([SocketStatusRoute, SocketDeviceRoute]);

export { socketServerService };
