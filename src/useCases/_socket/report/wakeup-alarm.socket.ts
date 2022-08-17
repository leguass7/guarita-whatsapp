import { api } from '#/services/Api';
import { SocketRouter } from '#/services/SocketServerService';

const SocketReportWakeupRoute = SocketRouter();

const path = 'report/wakeup-alarm';

SocketReportWakeupRoute.use(path, async (sockerServerService, socket, req, res) => {
  const response = await api.getDefault(path);
  console.log('resposta do servidor guarita: ', response);

  res({ success: true, message: 'estamos processando sua solicitação, por favor aguarde.' });
});

export { SocketReportWakeupRoute };
