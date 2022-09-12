import { AppDataSource } from 'src/app/app.datasource'
import { CreateChatRoomDto } from './dto/chat-property.dto'
import { ChatRoom } from './entities/chat-room.entity'
import { Message } from './entities/message.entity'
import { v4 as uuidv4 } from 'uuid'
import { InternalServerErrorException } from '@nestjs/common'

export const chatRepository = AppDataSource.getRepository(ChatRoom).extend({
	async findId(roomId: string): Promise<ChatRoom> {
		return await this.findOne({
			where: { id: roomId },
			relations: { messages: true },
		})
	},

	async getRooms(): Promise<ChatRoom[]> {
		return await this.find({
			order: {
				time_created: 'ASC',
			},
		})
	},

	async getMembers(roomId: string): Promise<string[]> {
		const qb = this.createQueryBuilder()
		const { members } = await qb
			.select('chat_room.members')
			.from(ChatRoom, 'chat_room')
			.where('chat_room.id = :roomId', { roomId })
			.getOne()
		return members
	},

	// async addMessage(newMessage: MessageI, roomId: string): Promise<Message> {
	// 	const room : ChatRoom = await this.findId(roomId);
	// 	const msg: Message = {
	// 		...newMessage,
	// 		room: room,
	// 	};
	// 	try {
	// 		await this.save(room);
	// 	} catch (e) {
	// 		console.log(e);
	// 		throw new InternalServerErrorException();
	// 	}
	// 	return msg;
	// }
})
