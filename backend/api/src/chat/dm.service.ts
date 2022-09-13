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
		userId: string,
	): Promise<any> {
		const newDMRoom = {
			...DMRoomData,
			id: uuidv4(),
			memberA: userId,
		}
		const DM = await this.DMRoomRepository.save(newDMRoom)

		return this.toDMFrontObject(DM, userId)
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

	async getRooms(userId: string): Promise<any[]> {
		const rooms = await this.DMRoomRepository.createQueryBuilder('dm')
			.where('dm.memberA = :userId', { userId })
			.orWhere('dm.memberB = :userId', { userId })
			.innerJoinAndSelect(User, 'user', 'dm.memberA = user.userId')
			.innerJoinAndSelect(User, 'user', 'dm.memberB = user.userId')
			.getRawMany()
		console.log(rooms)
		return rooms
	}
}
