import type { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthInitMiddleware implements NestMiddleware {
    constructor(private readonly users: UsersService) { }

    async use(req: Request, _res: Response, next: NextFunction) {
        if (req.session?.user === false || req.session?.userSession === false) {
            return next();
        }
        const auth = req.headers.authorization || '';
        if (auth) {
            const token = auth.replace(/^Bearer\s+/i, '').trim();
            if (!token) return next();
            try {
                const details = await this.users.findUserBySessionToken(token);
                req.session.user = details?.user ?? false;
                req.session.userSession = details?.session ?? false;
            } catch {
                req.session.user = false;
                req.session.userSession = false;
            }
            return next();
        }
        next();
    }
}