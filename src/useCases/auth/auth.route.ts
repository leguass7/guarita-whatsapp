import { Router } from 'express';

import { tokenService } from '../token/token.route';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { postAuthSchema } from './auth.validation';

const authService = new AuthService(tokenService);
const authController = new AuthController(authService);

const AuthRoute = Router();

AuthRoute.post('/', postAuthSchema, (req, res, next) => authController.authorize(req, res, next));

export { AuthRoute };
