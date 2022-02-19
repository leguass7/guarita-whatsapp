import { FindConditions, getRepository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { HttpException } from '#/app/exceptions/HttpException';
import { isDefined } from '#/helpers/validation';
import { LogClass } from '#/services/logger/log-decorator';

import { CreateTokenDto, FilterTokenDto } from './token.dto';
import { Token } from './token.entity';

@LogClass
export class TokenService {
  async findOne(_data: { tokenId: string; actived?: boolean }): Promise<any> {
    throw new HttpException(503, 'Não implementado');
  }

  async find(filter: FilterTokenDto = {}) {
    const { token, tokenId, actived, maxbot } = filter;
    const repository = getRepository(Token);

    const where: FindConditions<Token> = {};
    if (token) where.token = token;
    if (tokenId) where.id = tokenId;
    if (maxbot) where.maxbot = maxbot;
    if (isDefined(actived)) where.actived = !!actived;

    const result = await repository.find({ where });
    return result;
  }

  async update(tokenId: string, data: QueryDeepPartialEntity<Token>) {
    const repository = getRepository(Token);
    const result = await repository.update(tokenId, data);
    return result;
  }

  async create(data: CreateTokenDto) {
    const repository = getRepository(Token);
    const tokenData = repository.create(data);
    const result = await repository.save(tokenData);
    return result;
  }
}
