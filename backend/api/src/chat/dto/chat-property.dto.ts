import { ApiProperty } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsString,
	MinLength,
	MaxLength,
	IsAlphanumeric,
	maxLength,
} from 'class-validator'

export class CreateChatRoomDto {
	@IsNotEmpty()
	@IsAlphanumeric()
	@ApiProperty({ description: 'not empty' })
	name: string

	is_private: boolean
	password: string
}

export class AddMessageDto {
	message: string
	timestamp: Date
}
