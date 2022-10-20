import { api } from '#/services/Api';
import { logDev } from '#/services/LoggerService';
import { SocketRouter } from '#/services/SocketServerService';

const SocketDeviceRoute = SocketRouter();

const path = 'device/count';

SocketDeviceRoute.use(path, async (sockerServerService, socket, req, res) => {
  const query = new URLSearchParams({ ...req }).toString();
  const response = await api.getDefault(`${path}?${query}`);

  logDev('resposta do servidor guarita: ', JSON.stringify(response));

  res({ success: true, message: 'estamos processando sua solicitação, por favor aguarde.' });
});

export { SocketDeviceRoute };
