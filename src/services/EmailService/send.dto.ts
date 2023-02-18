export interface SenderPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface SendPayloadDto extends Omit<SenderPayload, 'from'> {
  from?: string;
}

export type MailServiceProvider = 'smtp' | 'sendgrid';
export interface EmailServiceResponseDto extends Record<any, any> {
  method: MailServiceProvider;
  messageId?: string;
}
export type EmailServiceSender = (payload: SenderPayload) => Promise<EmailServiceResponseDto>;

export interface SmtpResponseDto {
  accepted: string[];
  rejected: string[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: {
    from: string;
    to: string[];
  };
  messageId: string;
  method: MailServiceProvider;
}
