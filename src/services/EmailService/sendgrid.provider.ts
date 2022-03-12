import { setApiKey, send } from '@sendgrid/mail';

import { EmailServiceSender } from './send.dto';

export interface ISgConfig {
  key: string;
}

export function createTransporterSG(config: ISgConfig): EmailServiceSender {
  if (!config?.key) throw new Error('invalid_sendgrid_key');
  const sender: EmailServiceSender = async ({ from, html, subject, to }) => {
    setApiKey(config.key);
    const info = await send({ from, to, subject, html });
    return { ...info, method: 'sendgrid' };
  };
  return sender;
}
