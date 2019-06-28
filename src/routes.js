import { Router } from 'express';

import UserContoller from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

routes.post('/users', UserContoller.store);
routes.post('/sessions', SessionController.store);

export default routes;
