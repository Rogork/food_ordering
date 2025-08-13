import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type INewUser } from 'src/users/users.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Get('email-exists')
    public async emailExists(@Query('email') email: string) {
        const exists = await this.authService.emailExists(email);
        return { code: exists ? 200 : 404 };
    }

    @Post('register')
    public async register(@Body() user: INewUser) {
        return this.authService.register(user);
    }

    @Post('login')
    public async login(@Body() { email, password }: { email: string, password: string }) {
        return this.authService.signIn(email, password);
    }
}
