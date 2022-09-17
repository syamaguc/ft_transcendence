export class CreateChatRoomDto {
	name: string
	is_private: boolean
	password: string
}

export class CreateDMRoomDto {
	username: string
}

export class AddMessageDto {
	message: string
	timestamp: Date
}
