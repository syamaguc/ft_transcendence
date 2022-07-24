import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local.auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	//@UseGuards(LocalAuthGuard)
	@Post('/login')
	async login(
		@Body('name') name: string,
		@Body('password') password: string,
	) {
		return this.authService.login(name, password);
	}
}
