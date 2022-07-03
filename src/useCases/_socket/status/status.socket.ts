import { SocketRouter } from '#/services/SocketServerService';

const SocketStatusRoute = SocketRouter();

SocketStatusRoute.use('status', async (sockerServerService, socket, req, res) => {
  const totalClients = sockerServerService.clients.length;
  res({ success: true, message: 'ok', totalClients });
});

export { SocketStatusRoute };
