import { Router } from 'express';
import { activate, login, me, register } from './auth.controller';
import { activateSchema, loginSchema, registerSchema } from './auth.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.get('/activate/:token', validate(activateSchema), activate);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
