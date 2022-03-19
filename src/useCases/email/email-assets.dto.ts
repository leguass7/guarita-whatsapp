import { Request } from 'express';

interface AssetsParams extends Record<string, string> {
  imageName: string;
}

export interface RequestEmailAssetsDto extends Omit<Request, 'params'> {
  params: AssetsParams;
}
