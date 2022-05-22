import { Body, Controller, Delete, Get, Post, Param, ParseIntPipe, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserPropertyDto } from './dto/user-property.dto';
import { UserStatusPipe } from './pipe/user-status.pipe';

@Controller('users')
export class UsersController {

	@Get()
	getUsers() {
		return "getUsers Success!"
	}

	@Get('/:id')
	getUserById(
		@Param('id', ParseIntPipe) id: number) {
		return `getUserById Success! Parameter [id:${id}]`
	}

	@Post()
	@UsePipes(ValidationPipe)
	createUser(
		@Body() userPropertyDto: UserPropertyDto) {
		const { name, status } = userPropertyDto
		return `createUser Success! Prameter [name:${name}, status:${status}]`
	}

	@Delete('/:id')
	deleteUser(
		@Param('id', ParseIntPipe) id: number) {
		return `deleteUser Success! Prameter [id:${id}]`
	}

	@Patch('/:id')
	updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body('status', UserStatusPipe) status: string) {
		return `updateUser Success! Prameter [id:${id}, status:${status}]`
	}
}
