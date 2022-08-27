import { Injectable } from '@nestjs/common';
import { AddMessageDto, CreateChatRoomDto } from './dto/chat-property.dto';
import { ChatRoomI } from './interface/chat-room.interface';
import { MessageI } from './interface/message.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
	private charRooms: ChatRoomI[] = [
		{
			id: '1',
			name: 'random',
			members: ['all'],
			owner: null,
			admins: null,
			is_private: false,
			// channel_type: 'channel',
			logs: [],
			password: 'Test123!'
		},
	];

	createRoom(createChatRoomDto: CreateChatRoomDto): ChatRoomI {
		const newChatRoom: ChatRoomI = {
			id: uuidv4(),
			members: [],
			...createChatRoomDto,
			logs: [],
			admins: [],
			password:""
		};
		this.charRooms.push(newChatRoom);
		return newChatRoom;
	}

	addMessage(addMessageDto: AddMessageDto, roomId: uuidv4): MessageI {
		const newMessage: MessageI = {
			id: uuidv4(),
			...addMessageDto,
			timestamp: new Date(),
		};
		const room = this.charRooms.find((r) => r.id == roomId);
		room.logs.push(newMessage);
		return newMessage;
	}

	getMessageLog(roomId: string): MessageI[] {
		const room = this.charRooms.find((r) => r.id == roomId);
		return room.logs;
	}

	getRooms(): ChatRoomI[] {
		return this.charRooms;
	}

	joinRoom(roomId: string) {
		const room = this.charRooms.find((r) => r.id == roomId);
		room.members.push('user1');
	}
}
