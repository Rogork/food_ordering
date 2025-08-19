import { Body, Controller, Get, Headers, Post, Query, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type INewUser } from 'src/users/users.service';
import _ from "lodash";
import { RestaurantModel } from 'src/ordering/restaurant.service';
import { EOperation } from 'src/shared/meta.utils';
import { Database } from 'src/shared/database.service';
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService, private db: Database) {}

    @Get('test')
    public async test(@Query('name') name: string) {
        const _rest = await this.db.insert(new RestaurantModel({ name }));

        return { code: 200, data: { model: _rest } }
    }

    @Get('get-details')
    public async getDetails(@Headers('Authorization') token: string) {
        token = _.trimStart(token, 'Bearer ');
        const details = await this.authService.getDetails(token);
        if (details === undefined) return { code: 404 };
        return { code: 200, data: details }
    }

    @Get('email-exists')
    public async emailExists(@Query('email') email: string) {
        const exists = await this.authService.emailExists(email);
        return { code: exists ? 200 : 404 };
    }

    @Post('register')
    public async register(@Body() user: INewUser) {
        const userData = await this.authService.register(user);
        return { code: 200, data: userData };
    }

    @Post('login')
    public async login(@Body() { email, password }: { email: string, password: string }) {
        const user = await this.authService.signIn(email, password);
        return { code: 200, data: user };
    }

    @Post('logout')
    public async logout(@Session() session) {
        if (!session?.token) return { code: 200 };
        await this.authService.logout(session.token);
        return { code: 200 };
    }
}
