import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			//secret: configService.get<string>('JWT_SECRET'),
			secret: 'hogehoge',
			signOptions: { expiresIn: '1200s' },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy],
	exports: [AuthService],
})
export class AuthModule {}
