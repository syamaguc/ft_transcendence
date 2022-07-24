import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Param,
	ParseIntPipe,
	Patch,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { UserPropertyDto } from './dto/user-property.dto';
import { UserStatusPipe } from './pipe/user-status.pipe';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	getUsers() {
		return this.usersService.getUsers();
	}

	@Get('/:id')
	getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
		return this.usersService.getUserById(id);
	}

	@Post()
	@UsePipes(ValidationPipe)
	createUser(@Body() userPropertyDto: UserPropertyDto): Promise<User> {
		return this.usersService.createUser(userPropertyDto);
	}

	@Delete('/:id')
	deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
		return this.usersService.deleteUser(id);
	}

	@Patch('/:id')
	updateUser(
		@Param('id', ParseIntPipe) id: number,
		@Body('password') password: string,
	): Promise<User> {
		return this.usersService.updateUser(id, password);
	}
}
