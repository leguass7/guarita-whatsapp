import { SocketServerService } from '#/services/SocketServerService';
import { connectHandler, disconnectHandler } from '#socket/connection';
import { SocketDeviceRoute } from '#socket/device/device.socket';
import { SocketReportConnectionRoute } from '#socket/report/connection.socket';
import { SocketReportWakeupRoute } from '#socket/report/wakeup-alarm.socket';
import { SocketStatusRoute } from '#socket/status/status.socket';

import { loggerService } from './logger.service';

const socketServerService = new SocketServerService(loggerService);

socketServerService.on('onDisconnect', disconnectHandler);
socketServerService.on('onConnect', connectHandler);

socketServerService.use([SocketStatusRoute, SocketDeviceRoute, SocketReportWakeupRoute, SocketReportConnectionRoute]);

export { socketServerService };
