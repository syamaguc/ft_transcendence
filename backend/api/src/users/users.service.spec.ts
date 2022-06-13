import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';


const mockRepository = () => ({
	find: jest.fn(),
	findOne: jest.fn(),
	save: jest.fn(),
	delete: jest.fn(),
});

describe('UsersService', () => {
	let usersService: UsersService;
	let userRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{ provide: getRepositoryToken(User), useFactory: mockRepository }
			]
		}).compile();

		usersService = await module.get<UsersService>(UsersService);
		userRepository = await module.get(getRepositoryToken(User));
	});

	describe('getUsers', () => {
		it('get all users', async () => {
			userRepository.find.mockResolvedValue('mockUser');
			expect(userRepository.find).not.toHaveBeenCalled();

			const result = await usersService.getUsers()
			expect(userRepository.find).toHaveBeenCalled();
			expect(result).toEqual('mockUser');
		});
	});

	describe('getUserById', () => {
		it('find success', async () => {
			const mockUser = { name: 'syamaguc', status: 'ON' };
			userRepository.findOne.mockResolvedValue(mockUser);
			expect(userRepository.findOne).not.toHaveBeenCalled();

			const mockId: number = 1;
			const result = await usersService.getUserById(mockId);
			expect(userRepository.findOne).toHaveBeenCalled();
			expect(result).toEqual(mockUser);
		});

		it('user is not found', async () => {
			const mockId: number = 1;
			userRepository.findOne.mockResolvedValue(null);
			expect(usersService.getUserById(mockId)).rejects.toThrow(NotFoundException);
		});
	});

	describe('createUser', () => {
		it('insert user', async () => {
			const mockUser = { name: 'syamaguc', status: 'ON' };
			userRepository.save.mockResolvedValue(mockUser);
			expect(userRepository.save).not.toHaveBeenCalled();

			const result = await usersService.createUser(mockUser);
			expect(userRepository.save).toHaveBeenCalled();
		});
	});

	describe('deleteUser', () => {
		it('delete user', async () => {
			userRepository.delete.mockResolvedValue({ affected: 1 });
			expect(userRepository.delete).not.toHaveBeenCalled();
			const mockId: number = 1;
			await usersService.deleteUser(mockId);
			expect(userRepository.delete).toHaveBeenCalledWith(mockId);
		});

		it('delete error', async () => {
			userRepository.delete.mockResolvedValue({ affected: 0 });

			const mockId: number = 1;
			expect(usersService.deleteUser(mockId)).rejects.toThrow(NotFoundException);
		});
	});

	describe('updateUser', () => {
		it('update status', async () => {
			const mockStatus = 'ON';
			usersService.getUserById = jest.fn().mockResolvedValue({
				status: 'ON'
			});
			expect(usersService.getUserById).not.toHaveBeenCalled();

			const mockId: number = 1;
			const result = await usersService.updateUser(mockId, mockStatus);
			expect(usersService.getUserById).toHaveBeenCalled();
			expect(userRepository.save).toHaveBeenCalled();
			expect(result.status).toEqual(mockStatus);
		});
	});
});
