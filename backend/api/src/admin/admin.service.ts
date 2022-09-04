import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { UsersRepository } from 'src/user/user.repository'

@Injectable()
export class AdminService {
	//constructor() {} //private usersRepository: UsersRepository, //@InjectRepository(UsersRepository)

	async getAllUsers(): Promise<Partial<User[]>> {
		const query = await UsersRepository.createQueryBuilder('user')
			.select([
				'user.userId',
				'user.username',
				'user.status',
				'user.profile_picture',
				'user.isAdmin',
				'user.isBan',
			])
			.getMany()
		return query
	}

	async getAllAdmin(): Promise<Partial<User[]>> {
		const query = await UsersRepository.createQueryBuilder('user')
			.andWhere('user.isAdmin = :isAdmin', { isAdmin: true })
			.select([
				'user.userId',
				'user.username',
				'user.status',
				'user.profile_picture',
			])
			.getMany()
		return query
	}
}
