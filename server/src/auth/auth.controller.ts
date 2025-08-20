import { Body, Controller, Get, Headers, Post, Query, Session } from '@nestjs/common';
import { RestaurantModel } from 'src/ordering/restaurant.service';
import _ from "lodash";
import { UsersService } from 'src/users/users.service';
@Controller('auth')
export class AuthController {

    constructor(private userService: UsersService,) {}

    @Get('test')
    public async test(@Query('name') name: string) {
        const _rest = new RestaurantModel({ name });
        return { code: 200, data: { model: _rest } }
    }

    @Get('get-details')
    public async getDetails(@Headers('Authorization') token: string) {
        token = _.trimStart(token, 'Bearer ');
        const details = await this.userService.findUserBySessionToken(token);
        if (details === undefined) return { code: 401 };
        return { code: 200, data: details }
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
    public async login(@Body() { email, password }: { email: string, password: string }) {
        const user = await this.userService.signIn(email, password);
        return { code: 200, data: user };
    }

    @Post('logout')
    public async logout(@Session() session) {
        if (!session?.token) return { code: 200 };
        await this.userService.logout(session.token);
        return { code: 200 };
    }
}
