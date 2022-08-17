import { api } from '#/services/Api';
import { SocketRouter } from '#/services/SocketServerService';

const SocketDeviceRoute = SocketRouter();

const path = 'device/count';

SocketDeviceRoute.use(path, async (sockerServerService, socket, req, res) => {
  const response = await api.getDefault(path);
  console.log('resposta do servidor guarita: ', response);

  res({ success: true, message: 'estamos processando sua solicitação, por favor aguarde.' });
});

export { SocketDeviceRoute };
