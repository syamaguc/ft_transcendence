import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPropertyDto } from './dto/user-property.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
	) {}

	async getUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async getUserByName(username: string): Promise<User | undefined> {
		const found = this.userRepository.findOne({ name: username });
		if (!found) {
			throw new NotFoundException();
		}

		return found;
	}

	async getUserById(id: number): Promise<User | undefined> {
		const found = await this.userRepository.findOne(id);

		if (!found) {
			throw new NotFoundException();
		}

		return found;
	}

	async createUser(userPropertyDto: UserPropertyDto): Promise<User> {
		const { name, password } = userPropertyDto;
		const user = new User();
		user.name = name;
		user.password = password;
		//user.status = status;

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

	async updateUser(id: number, password: string): Promise<User> {
		const user = await this.getUserById(id);
		user.password = password;
		await this.userRepository.save(user);
		return user;
	}
}
