import type { MessageMetadata } from '../send.dto';

export interface RequestSendSocketTextDto {
  to: string;
  text: string;
  metaData?: MessageMetadata;
}
