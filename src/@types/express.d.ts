import { IPayloadToken } from '#/useCases/auth/auth.dto';

declare global {
  namespace Express {
    export interface Request {
      auth: IPayloadToken;
      jwt?: string;
    }
  }
}
