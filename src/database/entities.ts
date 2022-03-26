import { Contact } from '#/useCases/contact/contact.entity';
import { EmailSent } from '#/useCases/email/email-sent/email-sent.entity';
import { SendLog } from '#/useCases/send/send-log/send-log.entity';
import { Token } from '#/useCases/token/token.entity';

export const entities = [Token, Contact, SendLog, EmailSent];
