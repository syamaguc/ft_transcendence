export class CreateChatRoomDto {
	name: string;
	owner: string;
	is_private: boolean;
	channel_type: string;
}

export class AddMessageDto {
	message: string;
	user: string;
}
