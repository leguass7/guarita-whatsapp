import { LogClass } from '#/services/logger/log-decorator';
import { SocketService } from '#/services/SocketService';

@LogClass
export class SendSocketService {
  constructor(private socketService: SocketService) {}

  async sendText(data: any) {
    const response = await this.socketService.sendText(data);
    console.log('response', response);
    return response;
  }
}
