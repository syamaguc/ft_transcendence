export class CreateChatRoomDto {
	name: string
	is_private: boolean
	password: string
}

export class CreateDMRoomDto {
	memberB: string
}

export class AddMessageDto {
	message: string
	timestamp: Date
}
