import { AppDataSource } from "src/app/app.datasource"
import { CreateChatRoomDto } from "./dto/chat-property.dto";
import { ChatRoom } from "./entities/chat-room.entity"
import { MessageI } from "./interface/message.interface";
import { v4 as uuidv4 } from 'uuid';
import { InternalServerErrorException } from '@nestjs/common';

export const chatRepository = AppDataSource.getRepository(ChatRoom).extend({

	async createChatRoom(chatRoomData: CreateChatRoomDto): Promise<ChatRoom> {
		const chat = this.create(chatRoomData);
		// console.log(chat);
		chat.id = uuidv4();
		await this.save(chat);
		return chat;
	},

	async findId(roomId: string): Promise<ChatRoom> {
		return await this.findOne({
			where : {id : roomId},
		});
	},

	// async findAll(): Promise<ChatRoom[]> {
	// 	return await this.find();
	// },

	async addMessage(newMessage: MessageI, roomId: string): Promise<MessageI> {
		const room = await this.findId(roomId);
		room.logs.push(newMessage);
		try {
			await this.save(room);
		} catch (e) {
			console.log(e);
			throw new InternalServerErrorException();
		}
		return newMessage;
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