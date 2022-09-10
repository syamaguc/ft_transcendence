import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AddMessageDto, CreateChatRoomDto } from './dto/chat-property.dto'
import { MessageI } from './interface/message.interface'
import { Message } from './entities/message.entity'
import { v4 as uuidv4 } from 'uuid'
import { ChatRoom } from './entities/chat-room.entity'
import { chatRepository } from './chat.repository'
import { Repository } from 'typeorm'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(ChatRoom)
		private readonly chatRoomRepository: Repository<ChatRoom>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
	) {}

	async createRoom(chatRoomData: CreateChatRoomDto): Promise<ChatRoom> {
		const chat = await chatRepository.createChatRoom(chatRoomData)
		return chat
	}

	async addMessage(
		addMessageDto: AddMessageDto,
		roomId: string,
	): Promise<Message> {
		const newMessage: MessageI = {
			id: uuidv4(),
			...addMessageDto,
		}
		const room: ChatRoom = await chatRepository.findId(roomId)
		const message: Message = {
			...newMessage,
			room: room,
		}
		const savedMessage = await this.messageRepository.save(message)
		return savedMessage
	}

	async getMessageLog(roomId: string): Promise<Message[]> {
		const room: ChatRoom = await chatRepository.findId(roomId)
		return room.messages
	}

	async findRoom(roomId: string): Promise<ChatRoom> {
		const room: ChatRoom = await chatRepository.findId(roomId)
		return room
	}

	async getRooms(): Promise<ChatRoom[]> {
		const rooms = await chatRepository.find()
		return rooms
	}

	async joinRoom(roomId: string) {
		const room = await chatRepository.findId(roomId)
		room.members.push('user1')
	}
}
