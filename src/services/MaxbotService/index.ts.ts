import Maxbot, { MaxbotOptions } from 'maxbotjs';
export * from 'maxbotjs';

import { LogClass } from '#/services/logger/log-decorator';

export { MaxbotException } from './maxbot-exception';

@LogClass
export class MaxbotService extends Maxbot {
  constructor(config?: MaxbotOptions) {
    super(config);
  }
}
