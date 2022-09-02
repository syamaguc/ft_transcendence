import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddMessageDto, CreateChatRoomDto } from './dto/chat-property.dto';
import { ChatRoomI } from './interface/chat-room.interface';
import { MessageI } from './interface/message.interface';
import { Message } from './entities/message.entity';
import { v4 as uuidv4 } from 'uuid';
import { ChatRoom } from './entities/chat-room.entity';
import { chatRepository } from './chat.repository';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
	constructor (
		@InjectRepository(ChatRoom)
		private readonly chatRoomRepository: Repository<ChatRoom>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
	) {}

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

	async createRoom(chatRoomData: CreateChatRoomDto): Promise<ChatRoom> {
		const chat = await chatRepository.createChatRoom(chatRoomData);
		return chat;
	}

	async addMessage(addMessageDto: AddMessageDto, roomId: string): Promise<Message> {
		const newMessage: MessageI = {
			id: uuidv4(),
			...addMessageDto,
			timestamp: new Date(),
		};
		const room : ChatRoom = await chatRepository.findId(roomId);
		const message: Message = {
			...newMessage,
			room: room,
		};
		// console.log("roooooooom");
		const savedMessage = await this.messageRepository.save(message);
		// console.log("before push");

		// const ret = room.messages.push(savedMessage);
		// user.blockedUsers.splice(index, 1);
		// room.messages.push(savedMessage);

		// await this.chatRoomRepository.save(room);

		// const msg = await chatRepository.addMessage(newMessage, roomId);

		return savedMessage;
	}

	async getMessageLog(roomId: string): Promise<Message[]> {
		const room : ChatRoom = await chatRepository.findId(roomId);
		// console.log(room);
		// console.log("get message room:");
		// console.log(JSON.parse(room.logs));
		// const jsonObj =


		// console.log(room.logs);

		// return room.logs;
		return room.messages;
	}

	async findRoom(roomId: string): Promise<ChatRoom> {
		const room : ChatRoom = await chatRepository.findId(roomId);
		return room;
	}

	async getRooms(): Promise<ChatRoomI[]> {
		const rooms = await chatRepository.find();
		return rooms;
	}

	async joinRoom(roomId: string) {
		const room = await chatRepository.findId(roomId);
		room.members.push('user1');
	}
}
