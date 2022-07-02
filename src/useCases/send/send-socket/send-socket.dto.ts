import type { RequestSendTextDto } from '#/services/SocketServerService/server-to-client/send-text.dto';

import type { MessageMetadata } from '../send.dto';

export interface RequestSendSocketTextDto extends RequestSendTextDto {
  metaData?: MessageMetadata;
}
