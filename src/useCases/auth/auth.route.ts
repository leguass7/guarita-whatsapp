import { Router } from 'express';

import { googleService } from '#/services/google.service';

import { tokenService } from '../token/token.route';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getAuthGoogleSchema, postAuthSchema } from './auth.validation';

const authService = new AuthService(tokenService);
const authController = new AuthController(authService, googleService);

const AuthRoute = Router();

AuthRoute.get('/google', getAuthGoogleSchema, (req, res, next) => authController.googleCode(req, res, next));
AuthRoute.post('/', postAuthSchema, (req, res, next) => authController.authorize(req, res, next));

export { AuthRoute };
