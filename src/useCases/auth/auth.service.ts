import { sign, SignOptions } from 'jsonwebtoken';

import { HttpException } from '#/app/exceptions/HttpException';
import { jwtConfig } from '#/config';
import { LogClass } from '#/services/LoggerService/log-class.decorator';

import { TokenService } from '../token/token.service';
import { IPayloadToken } from './auth.dto';

@LogClass
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  async generateToken(payload: IPayloadToken) {
    const { secret, expiresIn } = jwtConfig;
    const signOptions: SignOptions = {};
    if (expiresIn) signOptions.expiresIn = expiresIn;

    const token = sign(payload, secret, signOptions);
    if (!token) throw new HttpException(403, 'Erro ao gerar token');

    await this.tokenService.create({ token, actived: true, maxbot: payload?.maxbotToken });

    return token;
  }

  async getToken(tokenId: string) {
    const user = await this.tokenService.findOne({ tokenId, actived: true });
    return user;
  }
}
