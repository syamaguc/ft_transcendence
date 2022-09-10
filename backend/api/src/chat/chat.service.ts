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

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(ChatRoom)
		private readonly chatRoomRepository: Repository<ChatRoom>,
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
		private jwtService: JwtService,
	) {}

	getUsernameFromSocket(socket: Socket) {
		const cookie = socket.handshake.headers['cookie']
		console.log(cookie)
		const { jwt: token } = parse(cookie)
		const payload: JwtPayload = this.jwtService.verify(token, {
			//secret: process.env.SECRET_JWT,
			secret: 'superSecret2022',
		})
		const { username } = payload
		return username
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
		const message: Message = {
			id: uuidv4(),
			userId: userId,
			...addMessageDto,
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

	async joinRoom(userId: uuidv4, roomId: string) {
		const room = await chatRepository.findId(roomId)
		room.members.push(userId)
	}
}
