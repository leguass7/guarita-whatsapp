import { SocketRouter } from '#/services/SocketServerService';

const SocketDeviceRoute = SocketRouter();

SocketDeviceRoute.use('device/count', async (sockerServerService, socket, req, res) => {
  console.log('req.phone', req.phone);
  res({ success: true, message: 'ok' });
});

export { SocketDeviceRoute };
