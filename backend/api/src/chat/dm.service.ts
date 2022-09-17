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

	/*
	async initRoom(userId: string): Promise<DMRoom> {
		const room = await this.DMRoomRepository.findOne({
			where: { memberA: userId, memberB: userId },
		})
		if (room) return room
		const selfDM = {
			id: uuidv4(),
			memberA: userId,
			memberB: userId,
		}
		return this.DMRoomRepository.save(selfDM)
	}
	*/
	toDMFrontObject(DM: DMRoom, userId: string): any {
		let otherMember = DM.memberA
		if (DM.memberA == userId) {
			otherMember = DM.memberB
		}
		const DMFrontObject = {
			id: DM.id,
			toUserName: otherMember,
			logs: DM.messages,
		}
		console.log(DMFrontObject)
		return DMFrontObject
	}

	async createRoom(
		DMRoomData: CreateDMRoomDto,
		selfUserId: string,
	): Promise<any> {
		const friendUserId = await UsersRepository.findOne({
			where: { username: DMRoomData.username },
		})
		console.log(friendUserId)
		if (!friendUserId) throw new WsException('User Not Found')
		const newDMRoom = {
			id: uuidv4(),
			memberA: selfUserId,
			memberB: friendUserId.userId,
		}
		const DM = await this.DMRoomRepository.save(newDMRoom)

		const DMFrontObject = {
			id: DM.id,
			toUserName: DMRoomData.username,
			logs: DM.messages,
		}

		return DMFrontObject
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
		const messagesWithUserInfo = await messageRepository.getMessages(roomId)
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
			.getRawMany()
		console.log(room)
		return room
	}

	async getRooms(userId: string): Promise<any[]> {
		const rooms = await this.DMRoomRepository.createQueryBuilder('dm')
			.select([
				'dm.id AS id',
				'userA.username AS user1',
				'userB.username AS user2',
			])
			.orderBy('dm.time_created', 'ASC')
			.where('dm.memberA = :userId', { userId })
			.orWhere('dm.memberB = :userId', { userId })
			.innerJoin(User, 'userA', 'dm.memberA = userA.userId')
			.innerJoin(User, 'userB', 'dm.memberB = userB.userId')
			.getRawMany()
		console.log(rooms)
		return rooms
	}
}
