import { Router } from 'express';

import { dataSource } from '#/database';

import { TokenController } from './token.controller';
import { TokenService } from './token.service';

const tokenService = new TokenService(dataSource);
const tokenController = new TokenController(tokenService);

const TokenRoute = Router();

TokenRoute.get('/', (req, res, next) => tokenController.list(req, res, next));

export { TokenRoute, tokenService };
