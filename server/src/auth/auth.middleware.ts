import type { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthInitMiddleware implements NestMiddleware {
    constructor(private readonly users: UsersService) { }

    async use(req: Request, _res: Response, next: NextFunction) {
        if (req.session?.user === false || req.session?.userSession === false || (!req.headers.authorization && !req.sessionID)) {
            return next();
        }
        const auth = req.headers.authorization || '';
        const token = auth.replace(/^Bearer\s+/i, '').trim();
        const sessionId = req.sessionID;
        try {
            const details = token ? await this.users.findUserBySessionToken(token) : await this.users.findUserBySessionId(sessionId);
            req.session.user = details?.user ? { _id: details.user._id } : false;
            req.session.userSession = details?.session ?? false;
        } catch (e) {
            console.log(e);
            req.session.user = false;
            req.session.userSession = false;
        }
        return next();
    }
}