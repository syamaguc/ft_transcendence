export class CreateChatRoomDto {
	name: string;
	owner: string;
	is_private: boolean;
	password: string;
}

export class AddMessageDto {
	message: string;
	user: string;
}
