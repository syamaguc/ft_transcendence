import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AddMessageDto, CreateDMRoomDto } from './dto/chat-property.dto'
import { Message } from './entities/message.entity'
import { v4 as uuidv4 } from 'uuid'
import { DMRoom } from './entities/dm-room.entity'
import { Repository } from 'typeorm'
import { messageRepository } from './message.repository'
import { User } from 'src/user/entities/user.entity'
import { UsersRepository } from 'src/user/user.repository'
import { WsException } from '@nestjs/websockets'

@Injectable()
export class DMService {
	constructor(
		@InjectRepository(DMRoom)
		private readonly DMRoomRepository: Repository<DMRoom>,
	) {}

	async createRoom(
		DMRoomData: CreateDMRoomDto,
		selfUserId: string,
	): Promise<any> {
		if (!selfUserId)
			throw new WsException('Internal Server Error: userId is not passed')
		const friendUserId = await UsersRepository.findOne({
			where: { username: DMRoomData.username },
		})
		if (!friendUserId) throw new WsException('User Not Found')
		const existingRoom = await this.DMRoomRepository.findOne({
			where: [
				{ memberA: selfUserId, memberB: friendUserId.userId },
				{ memberA: friendUserId.userId, memberB: selfUserId },
			],
		})
		if (existingRoom) {
			const DMFrontObject = {
				id: existingRoom.id,
				user1: DMRoomData.username,
				logs: existingRoom.messages,
			}
			return DMFrontObject
		}
		const newDMRoom = {
			id: uuidv4(),
			memberA: selfUserId,
			memberB: friendUserId.userId,
		}
		const DM = await this.DMRoomRepository.save(newDMRoom)

		const DMFrontObject = {
			id: DM.id,
			user1: DMRoomData.username,
			logs: DM.messages,
		}

		return DMFrontObject
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

	async addMessage(
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

	async getMessageLog(roomId: string): Promise<any> {
		const messagesWithUserInfo = await messageRepository.getDMMessages(
			roomId,
		)
		return messagesWithUserInfo
	}

	async getRoom(roomId: string): Promise<any[]> {
		const room = await this.DMRoomRepository.createQueryBuilder('dm')
			.select([
				'dm.id AS id',
				'userA.username AS user1',
				'userB.username AS user2',
			])
			.where('dm.id = :roomId', { roomId })
			.innerJoin(User, 'userA', 'dm.memberA = userA.userId')
			.innerJoin(User, 'userB', 'dm.memberB = userB.userId')
			.getRawOne()
		return room
	}

	async getRooms(userId: string): Promise<any[]> {
		const rooms = await this.DMRoomRepository.createQueryBuilder('dm')
			.select([
				'dm.id AS id',
				'userA.username AS user1',
				'userB.username AS user2',
			])
			.orderBy('dm.time_created', 'DESC')
			.where('dm.memberA = :userId', { userId })
			.orWhere('dm.memberB = :userId', { userId })
			.innerJoin(User, 'userA', 'dm.memberA = userA.userId')
			.innerJoin(User, 'userB', 'dm.memberB = userB.userId')
			.getRawMany()
		return rooms
	}

	async getRoomIdByUserIds(user1: string, user2: string): Promise<string> {
		const room: DMRoom = await this.DMRoomRepository.findOne({
			where: [
				{ memberA: user1, memberB: user2 },
				{ memberA: user2, memberB: user1 },
			],
		})
		if (!room) return ''
		return room.id
	}
}
