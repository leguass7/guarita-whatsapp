import { Token } from './token.entity';

export type CreateTokenDto = Omit<Token, 'id'>;

export interface FilterTokenDto {
  tokenId?: string;
  actived?: boolean;
  token?: string;
  maxbot?: string;
}
