import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({
			secretOrKey: configService.get<string>('JWT_SECRET'),
			//secretOrKey: 'hogehoge'
		});
	}

	async validate(username: string, password: string): Promise<any> {
		const user = await this.authService.validateUser(username, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
