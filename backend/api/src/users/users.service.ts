import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPropertyDto } from './dto/user-property.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) { }

	async getUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async getUserById(id: number): Promise<User> {
		const found = await this.userRepository.findOne(id);

		if (!found) {
			throw new NotFoundException();
		}

		return found;
	}

	async createUser(
		userPropertyDto: UserPropertyDto
	): Promise<User> {
		const { name, status } = userPropertyDto;
		const user = new User();
		user.name = name;
		user.status = status;

		try {
			await this.userRepository.save(user);
		} catch (error) {
			throw new InternalServerErrorException();
		}

		return user;
	}

	async deleteUser(id: number): Promise<void> {
		const result = await this.userRepository.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException();
		}
	}

	async updateUser(
		id: number,
		status: string): Promise<User> {
		const user = await this.getUserById(id);
		user.status = status;
		await this.userRepository.save(user);
		return user;
	}
}
