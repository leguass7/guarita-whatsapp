import { format } from 'date-fns-tz';

import { isDevMode } from '#/config';
import type { SocketServerEmitterHandler } from '#/services/SocketServerService/socker-server.emitter';
import { loggerService } from '#/useCases/logger.service';
import { smtpService } from '#/useCases/smtp.service';

const to = 'leandro.sbrissa@hotmail.com;atendimento01@dessistemas.com.br';
const dev = isDevMode ? `<br/><b>(TESTE DE DESENVOLVIMENTO)</b>` : '';
export const disconnectHandler: SocketServerEmitterHandler<'onDisconnect'> = () => {
  const date = format(new Date(), 'dd/MM/yyyy HH:mm:ss', { timeZone: 'America/Fortaleza' });
  smtpService
    .send({
      to,
      subject: 'WHATSAPP BOT DESCONECTADO',
      html: `bot acaba de se desconectar <b>${date}</b>${dev}`,
    })
    .then(() => loggerService.logging('BOT CONECTADO'));
};

export const connectHandler: SocketServerEmitterHandler<'onConnect'> = () => {
  const date = format(new Date(), 'dd/MM/yyyy HH:mm:ss', { timeZone: 'America/Fortaleza' });

  smtpService
    .send({ to, subject: 'WHATSAPP BOT CONECTADO', html: `bot acaba de se conectar <b>${date}</b>${dev}` })
    .then(() => loggerService.logging('BOT CONECTADO'));
};
