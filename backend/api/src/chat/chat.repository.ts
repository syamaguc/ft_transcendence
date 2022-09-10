import { AppDataSource } from 'src/app/app.datasource'
import { CreateChatRoomDto } from './dto/chat-property.dto'
import { ChatRoom } from './entities/chat-room.entity'
import { v4 as uuidv4 } from 'uuid'
import { InternalServerErrorException } from '@nestjs/common'

export const chatRepository = AppDataSource.getRepository(ChatRoom).extend({
	async createChatRoom(chatRoomData: CreateChatRoomDto): Promise<ChatRoom> {
		const chat = this.create(chatRoomData)
		chat.id = uuidv4()
		await this.save(chat)
		return chat
	},

	async findId(roomId: string): Promise<ChatRoom> {
		return await this.findOne({
			where: { id: roomId },
			relations: { messages: true },
		})
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
