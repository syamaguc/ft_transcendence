import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { UsersRepository } from '../user.repository'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { User } from '../entities/user.entity'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor() {
		//private usersRepository: UsersRepository, //@InjectRepository(UsersRepository)
		super({
			//secretOrKey: process.env.SECRET_JWT,
			secretOrKey: 'superSecret2022',
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					const accessToken = request?.cookies['jwt']
					return accessToken
				},
			]),
		})
	}

	async validate(payload: JwtPayload): Promise<User> {
		const { username } = payload
		const user: User = await UsersRepository.findOne({
			where: {
				username: username,
			},
		})

		if (!user) {
			throw new UnauthorizedException()
		}
		return user
	}
}
