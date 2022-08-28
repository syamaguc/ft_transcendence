import { AppDataSource } from "src/app/app.datasource"
import { CreateChatRoomDto } from "./dto/chat-property.dto";
import { ChatRoom } from "./entities/chat-room.entity"
import { v4 as uuidv4 } from 'uuid';



export const chatRepository = AppDataSource.getRepository(ChatRoom).extend({
	async createChatRoom(chatRoomData: CreateChatRoomDto): Promise<ChatRoom> {
		const chat = this.create(chatRoomData);
		chat.id = uuidv4();
		await this.save(chat);
		return chat;
	}
});

// const chat = new ChatRoom();
// chat.name = "Timber";
// chat.is_private = false;
// chat.logs = [];
// await chatRepository.save(chat);

// const allChats = await chatRepository.find()
// const firstChat = await chatRepository.findOneBy({
//     id: 1,
// }) // find by id
// const timber = await chatRepository.findOneBy({
//     firstName: "Timber",
//     lastName: "Saw",
// }) // find by firstName and lastName

// await userRepository.remove(timber)
