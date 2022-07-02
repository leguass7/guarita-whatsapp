import { SocketRouter } from '#/services/SocketServerService';

const DeviceSocketRoute = SocketRouter();

DeviceSocketRoute.use('count-device', (sockerServerService, socket, req, cb) => {
  console.log('req.phone', req.phone);
  cb({ success: true, message: 'ok' });
});

export { DeviceSocketRoute };
