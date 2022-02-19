import { env } from './env';

interface IJwtConfig {
  secret: string;
  expiresIn?: number | string;
}
export const jwtConfig: IJwtConfig = {
  secret: env.APP_SECRET || '123456',
  // expiresIn: '365d',
};
export default jwtConfig;
