import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthInitMiddleware implements NestMiddleware {
    readonly userService: UsersService;
    async use(req: Request, res: Response, next: NextFunction) {
        if (req.session.user === false || req.session.userSession === false) return next();
        const token = _.trimStart(req.headers.authorization, 'Bearer ');
        const details = await this.userService.findUserBySessionToken(token);
        req.session.user = details?.user || false;
        req.session.userSession = details?.session || false;
        next();
    }
}