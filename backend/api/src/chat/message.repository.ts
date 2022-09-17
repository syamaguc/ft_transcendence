import { AppDataSource } from 'src/app/app.datasource'
import { User } from 'src/user/entities/user.entity'
import { Message } from './entities/message.entity'

export const messageRepository = AppDataSource.getRepository(Message).extend({
	async getMessages(roomId: string): Promise<any> {
		return this.createQueryBuilder('message')
			.select([
				'message.*',
				'user.username AS username',
				'user.profile_picture AS profile_picture',
			])
			.innerJoin(User, 'user', 'message.userId = user.userId')
			.where('message.room = :roomId', { roomId })
			.orderBy('message.timestamp', 'ASC')
			.getRawMany()
	},

	async getDMMessages(roomId: string): Promise<any> {
		return this.createQueryBuilder('message')
			.select([
				'message.*',
				'user.username AS username',
				'user.profile_picture AS profile_picture',
			])
			.innerJoin(User, 'user', 'message.userId = user.userId')
			.where('message.DMroom = :roomId', { roomId })
			.orderBy('message.timestamp', 'ASC')
			.getRawMany()
	},

	async addMessage(message: Partial<Message>): Promise<any> {
		await this.save(message)
		return this.createQueryBuilder('message')
			.select([
				'message.*',
				'user.username AS username',
				'user.profile_picture AS profile_picture',
			])
			.innerJoin(User, 'user', 'message.userId = user.userId')
			.where('message.id = :id', { id: message.id })
			.getRawOne()
	},
})
