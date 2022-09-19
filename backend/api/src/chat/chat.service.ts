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
import { User } from 'src/user/entities/user.entity'
import { UsersRepository } from 'src/user/user.repository'

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
		if (!token) {
			console.log('no JWT provided')
			socket.disconnect()
			return
		}
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
			admins: [userId],
		}
		const chat = await this.chatRoomRepository.save(newChatRoom)
		console.log(chat)
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

	async addAdmin(userId: string, roomId: string): Promise<ChatRoom> {
		const room = await chatRepository.findId(roomId)
		if (room.admins.indexOf(userId) === -1) {
			console.log('=========admin is added=========')
			room.admins.push(userId)
			return chatRepository.save(room)
		}
		//not found
		return room
	}

	async banUser(userId: string, roomId: string): Promise<ChatRoom> {
		const room = await chatRepository.findId(roomId)
		if (room.banned.indexOf(userId) === -1) {
			console.log('=========user is banned=========')
			room.banned.push(userId)
			return chatRepository.save(room)
		}
		//not found
		return room
	}

	async muteUser(userId: string, roomId: string): Promise<ChatRoom> {
		const room = await chatRepository.findId(roomId)
		if (room.muted.indexOf(userId) === -1) {
			console.log('=========user is muted=========')
			room.muted.push(userId)
			return chatRepository.save(room)
		}
		//not found
		return room
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
		const rooms = await chatRepository.getRooms()
		return rooms
	}

	async getMembers(roomId: string): Promise<User[]> {
		const members = await chatRepository.getMembers(roomId)
		return UsersRepository.createQueryBuilder('user')
			.select([
				'user.userId',
				'user.username',
				'user.profile_picture',
				'user.elo',
				'user.game_won',
				'user.lost_game',
				'user.ratio',
				'user.status',
			])
			.where('user.userId IN (:...members)', { members })
			.getMany()
	}

	async joinRoom(userId: uuidv4, roomId: string): Promise<ChatRoom> {
		const room = await chatRepository.findId(roomId)
		console.log(room)
		if (room.members.indexOf(userId) === -1) {
			console.log('=========new member joined the channel=========')
			room.members.push(userId)
			return chatRepository.save(room)
		}
		// else {
		// 	console.log(
		// 		'============error in join room: the user is already a member==========',
		// 	)
		// }
	}

	async joinProtectedRoom(
		userId: uuidv4,
		roomId: string,
		password: string,
	): Promise<ChatRoom> {
		const room = await chatRepository.findId(roomId)
		console.log(room)
		if (room.members.indexOf(userId) === -1) {
			// 暗号化される予定なのでデコードする必要がある
			const roomPassword = room.password
			if (roomPassword == password) {
				console.log('=========new member joined the channel=========')
				room.members.push(userId)
				return chatRepository.save(room)
			} else {
				return null
			}
		}
	}
}
