import { Router } from 'express';

import { authMiddleware } from '#/useCases/auth/auth.middleware';

import { AuthRoute } from './auth/auth.route';
import { ContactRoute } from './contact/contact.route';
import { SendRoute } from './send/send.route';
import { TokenRoute } from './token/token.route';

const IndexRoute = Router();

IndexRoute.get('/healthz', (req, res) => {
  return res.status(200).send({ health: true }).end();
});

IndexRoute.use('/auth', AuthRoute);

IndexRoute.use(authMiddleware);
IndexRoute.use('/token', TokenRoute);
IndexRoute.use('/contact', ContactRoute);
IndexRoute.use('/send', SendRoute);

export { IndexRoute };
