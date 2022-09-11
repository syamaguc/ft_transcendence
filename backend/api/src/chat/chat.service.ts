import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AddMessageDto, CreateChatRoomDto } from './dto/chat-property.dto'
import { Message } from './entities/message.entity'
import { v4 as uuidv4 } from 'uuid'
import { ChatRoom } from './entities/chat-room.entity'
import { chatRepository } from './chat.repository'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { Socket } from 'socket.io'
import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface'
import { parse } from 'cookie'
import { messageRepository } from './message.repository'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(ChatRoom)
		private readonly chatRoomRepository: Repository<ChatRoom>,
		private jwtService: JwtService,
	) {}

	setUserIdToSocket(socket: Socket) {
		const cookie = socket.handshake.headers['cookie']
		const { jwt: token } = parse(cookie)
		const payload: JwtPayload = this.jwtService.verify(token, {
			//secret: process.env.SECRET_JWT,
			secret: 'superSecret2022',
		})
		const { userid } = payload
		socket.data.userId = userid
	}

	async createRoom(
		chatRoomData: CreateChatRoomDto,
		userId: string,
	): Promise<ChatRoom> {
		const newChatRoom = {
			...chatRoomData,
			id: uuidv4(),
			owner: userId,
		}
		const chat = await this.chatRoomRepository.save(newChatRoom)
		return chat
	}

	async addMessage(
		addMessageDto: AddMessageDto,
		userId: uuidv4,
		roomId: string,
	): Promise<Message> {
		const room: ChatRoom = await chatRepository.findId(roomId)
		const messageId = uuidv4()
		const message: Message = {
			id: messageId,
			userId: userId,
			...addMessageDto,
			room: room,
		}
		return messageRepository.addMessage(message)
	}

	async getMessageLog(roomId: string): Promise<any> {
		const messagesWithUserInfo = await messageRepository.getMessages(roomId)
		return messagesWithUserInfo
	}

	async findRoom(roomId: string): Promise<ChatRoom> {
		const room: ChatRoom = await chatRepository.findId(roomId)
		return room
	}

	async getRooms(): Promise<ChatRoom[]> {
		const rooms = await chatRepository.find()
		return rooms
	}

	async joinRoom(userId: uuidv4, roomId: string) {
		const room = await chatRepository.findId(roomId)
		room.members.push(userId)
	}
}
