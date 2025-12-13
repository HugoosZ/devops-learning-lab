import type { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'

export class AuthController {
    private authService: AuthService

    constructor(authService: AuthService) {
        this.authService = authService
    }

    public async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body
        const isValid = await this.authService.validateUser(email, password)

        if (isValid) {
            res.status(200).json({ message: 'Login successful' })
        } else {
            res.status(401).json({ message: 'Invalid credentials' })
        }
    }

    public logout(_req: Request, res: Response): void {
        res.status(200).json({ message: 'Logout successful' })
    }
}