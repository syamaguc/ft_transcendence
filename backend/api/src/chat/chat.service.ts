import { Injectable } from '@nestjs/common';
import { AddMessageDto, CreateChatRoomDto } from './dto/chat-property.dto';
import { ChatRoomI } from './interface/chat-room.interface';
import { MessageI } from './interface/message.interface';
import { v4 as uuidv4 } from 'uuid';
import { ChatRoom } from './entities/chat-room.entity';
import { chatRepository } from './chat.repository';

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


	// createRoom(createChatRoomDto: CreateChatRoomDto): ChatRoomI {
	// 	const newChatRoom: ChatRoomI = {
	// 		id: uuidv4(),
	// 		members: [],
	// 		...createChatRoomDto,
	// 		logs: [],
	// 		admins: [],
	// 		password:""
	// 	};
	// 	this.charRooms.push(newChatRoom);
	// 	return newChatRoom;
	// }

	async createRoom(chatRoomData: CreateChatRoomDto): Promise<ChatRoom> {
		const chat = await chatRepository.createChatRoom(chatRoomData);
		return chat;
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

	// getRooms(): ChatRoomI[] {
	// 	return this.charRooms;
	// }

	async getRooms(): Promise<ChatRoomI[]> {
		const rooms = await chatRepository.findAll();
		return rooms;
	}

	joinRoom(roomId: string) {
		const room = this.charRooms.find((r) => r.id == roomId);
		// gets error when trying to access room.members
		// room.members.push('user1');
	}
}
