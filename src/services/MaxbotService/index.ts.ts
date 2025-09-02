import Maxbot, { type MaxbotOptions } from 'maxbotjs';

import { LogClass } from '../LoggerService/log-class.decorator';
export * from 'maxbotjs';

export { MaxbotException } from './maxbot-exception';

@LogClass
export class MaxbotService extends Maxbot {
  constructor(config?: MaxbotOptions) {
    super(config);
  }
}
