import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AddMessageDto } from './dto/chat-property.dto'
import { Message } from './entities/message.entity'
import { v4 as uuidv4 } from 'uuid'
import { DMRoom } from './entities/dm-room.entity'
import { Repository } from 'typeorm'
import { messageRepository } from './message.repository'
import { User } from 'src/user/entities/user.entity'
import { UsersRepository } from 'src/user/user.repository'
import { WsException } from '@nestjs/websockets'
import { DMRawData } from './interfaces/dm.interface'

@Injectable()
export class DMService {
	constructor(
		@InjectRepository(DMRoom)
		private readonly DMRoomRepository: Repository<DMRoom>,
	) {}

	async getUserIdByUsername(username: string): Promise<string> {
		const user = await UsersRepository.findOne({
			where: { username: username },
		})
		if (!user) {
			throw new WsException('User Not Found')
		}
		return user.userId
	}

	async getRoomByUserIds(userId1: string, userId2: string): Promise<DMRoom> {
		return this.DMRoomRepository.findOne({
			where: [
				{ memberA: userId1, memberB: userId2 },
				{ memberA: userId2, memberB: userId1 },
			],
		})
	}

	async createRoomByUserIds(user1: string, user2: string): Promise<DMRoom> {
		const newDMRoom = {
			id: uuidv4(),
			memberA: user1,
			memberB: user2,
		}
		const DM = await this.DMRoomRepository.save(newDMRoom)
		return DM
	}

	async addMessageByRoomId(
		addMessageDto: AddMessageDto,
		userId: uuidv4,
		roomId: string,
	): Promise<Message> {
		const room: DMRoom = await this.DMRoomRepository.findOne({
			where: { id: roomId },
		})
		const messageId = uuidv4()
		const message: Partial<Message> = {
			id: messageId,
			userId: userId,
			...addMessageDto,
			DMroom: room,
		}
		return messageRepository.addMessage(message)
	}

	async getMessageLogByRoomId(roomId: string): Promise<any> {
		const messagesWithUserInfo = await messageRepository.getDMMessages(
			roomId,
		)
		return messagesWithUserInfo
	}

	async getRoomByRoomId(roomId: string): Promise<DMRawData> {
		const room = await this.DMRoomRepository.createQueryBuilder('dm')
			.select([
				'dm.id AS id',
				'userA.username AS user1',
				'userA.userId AS user1Id',
				'userB.username AS user2',
				'userB.userId AS user2Id',
			])
			.where('dm.id = :roomId', { roomId })
			.innerJoin(User, 'userA', 'dm.memberA = userA.userId')
			.innerJoin(User, 'userB', 'dm.memberB = userB.userId')
			.getRawOne()
		return room
	}

	async getRoomsByUserId(userId: string): Promise<DMRawData[]> {
		const rooms = await this.DMRoomRepository.createQueryBuilder('dm')
			.select([
				'dm.id AS id',
				'userA.username AS user1',
				'userA.userId AS user1Id',
				'userB.username AS user2',
				'userB.userId AS user2Id',
			])
			.orderBy('dm.time_created', 'DESC')
			.where('dm.memberA = :userId', { userId })
			.orWhere('dm.memberB = :userId', { userId })
			.innerJoin(User, 'userA', 'dm.memberA = userA.userId')
			.innerJoin(User, 'userB', 'dm.memberB = userB.userId')
			.getRawMany()
		return rooms
	}
}
