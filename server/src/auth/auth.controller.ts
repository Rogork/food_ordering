import { Body, Controller, Get, Header, Headers, Ip, Post, Query, Request, Session } from '@nestjs/common';
import express from 'express';
import _ from "lodash";
import { _UserModel, UsersService } from 'src/users/users.service';
@Controller('auth')
export class AuthController {

    constructor(private userService: UsersService,) { }

    getUserInfo(sessionId: string, headers: Headers, ipFallback: string) {
        const xff = headers['x-forwarded-for'];
        const ip = (headers['cf-connecting-ip'] as string) ||
            (headers['true-client-ip'] as string) ||
            (headers['x-real-ip'] as string) ||
            (Array.isArray(xff) ? xff[0] : (xff as string)?.split(',')[0]?.trim()) ||
            ipFallback ||
            null;
        const userAgent = (headers['user-agent'] as string) ?? null;
        const deviceName = (headers['x-device-name'] as string) || (headers['x-client-name'] as string) || '';
        return { sessionId: sessionId, ip: ip, device: deviceName, agent: userAgent }
    }

    @Get('get-details')
    @Header('Cache-Control', 'no-cache')
    public async getDetails(@Headers('Authorization') token: string) {
        token = _.trimStart(token, 'Bearer ');
        const details = await this.userService.findUserBySessionToken(token);
        if (details === null) return { code: 401 };
        return { code: 200, data: details };
    }

    @Get('email-exists')
    @Header('Cache-Control', 'no-cache')
    public async emailExists(@Query('email') email: string) {
        const exists = await this.userService.emailExists(email);
        return { code: exists ? 200 : 404 };
    }

    @Post('register')
    @Header('Cache-Control', 'no-cache')
    public async register(@Body() user: { name?: string, email: string, password: string }, @Request() request: express.Request, @Headers() headers: Headers, @Ip() ip: string) {
        const userData = await this.userService.register(user, this.getUserInfo(request.sessionID, headers, ip));
        return { code: 200, data: userData };
    }

    @Post('login')
    @Header('Cache-Control', 'no-cache')
    public async login(@Body() { email, password }: { email: string, password: string }, @Request() request: express.Request, @Headers() headers, @Ip() ip: string) {
        try {
            const user = await this.userService.signIn(email, password, this.getUserInfo(request.sessionID, headers, ip));
            return { code: 200, data: user };
        } catch (e) {
            console.log(e);
            return { code: 400, msg: 'Unknown error' };
        }
    }

    @Post('logout')
    @Header('Cache-Control', 'no-cache')
    public async logout(@Session() session) {
        if (!session?.token) return { code: 200 };
        await this.userService.logout(session.token);
        return { code: 200 };
    }
}
