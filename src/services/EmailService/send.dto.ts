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
}
export type EmailServiceSender = (payload: SenderPayload) => Promise<EmailServiceResponseDto>;
