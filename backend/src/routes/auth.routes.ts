import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';

const router = Router();
const authController = new AuthController(new AuthService());

export function setAuthRoutes(app: Router) {
    app.post('/api/auth/login', authController.login.bind(authController));
    app.post('/api/auth/logout', authController.logout.bind(authController));
}