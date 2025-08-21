import { Body, Controller, Get, Headers, Ip, Post, Query, Request, Session } from '@nestjs/common';
import { RestaurantModel } from 'src/ordering/restaurant.service';
import _ from "lodash";
import { _UserModel, UserModel, UsersService } from 'src/users/users.service';
@Controller('auth')
export class AuthController {

    constructor(private userService: UsersService,) { }

    @Get('test')
    public async test(@Query('name') name: string) {
        const user = new UserModel({ email: 'lol', password: '12345', dob: ('1990-01-01' as any) });
        // const user = new _UserModel();
        // user.email = 'lol';
        // user.password = '12345';
        // user.dob = ('1990-01-01' as any);
        console.log(user);
        return { code: 200, data: { model: user } };
    }

    @Get('get-details')
    public async getDetails(@Headers('Authorization') token: string) {
        token = _.trimStart(token, 'Bearer ');
        const details = await this.userService.findUserBySessionToken(token);
        if (details === undefined) return { code: 401 };
        return { code: 200, data: details };
    }

    @Get('email-exists')
    public async emailExists(@Query('email') email: string) {
        const exists = await this.userService.emailExists(email);
        return { code: exists ? 200 : 404 };
    }

    @Post('register')
    public async register(@Body() user: { name?: string, email: string, password: string }) {
        const userData = await this.userService.register(user);
        return { code: 200, data: userData };
    }

    @Post('login')
    public async login(@Body() { email, password }: { email: string, password: string }, @Headers() headers, @Ip() ipFallback) {
        const xff = headers['x-forwarded-for'];
        const ip = (headers['cf-connecting-ip'] as string) ||
            (headers['true-client-ip'] as string) ||
            (headers['x-real-ip'] as string) ||
            (Array.isArray(xff) ? xff[0] : (xff as string)?.split(',')[0]?.trim()) ||
            ipFallback ||
            null;
        const userAgent = (headers['user-agent'] as string) ?? null;
        const deviceName = (headers['x-device-name'] as string) || (headers['x-client-name'] as string) || '';

        const user = await this.userService.signIn(email, password, { ip: ip, device: deviceName, agent: userAgent });
        return { code: 200, data: user };
    }

    @Post('logout')
    public async logout(@Session() session) {
        if (!session?.token) return { code: 200 };
        await this.userService.logout(session.token);
        return { code: 200 };
    }
}
