export interface SenderPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface SendPayloadDto extends Omit<SenderPayload, 'from'> {
  from?: string;
}

export interface EmailServiceResponse extends Record<any, any> {
  method: 'smtp' | 'sendgrid';
}
export type EmailServiceSender = (payload: SenderPayload) => Promise<EmailServiceResponse>;
