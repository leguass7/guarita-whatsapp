import { SocketRouter } from '#/services/SocketServerService';

const SocketDeviceRoute = SocketRouter();

SocketDeviceRoute.use('device/count', async (sockerServerService, socket, req, cb) => {
  console.log('req.phone', req.phone);
  cb({ success: true, message: 'ok' });
});

export { SocketDeviceRoute };
