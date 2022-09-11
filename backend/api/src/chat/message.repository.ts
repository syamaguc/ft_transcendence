import { AppDataSource } from 'src/app/app.datasource'
import { User } from 'src/user/entities/user.entity'
import { Message } from './entities/message.entity'

export const messageRepository = AppDataSource.getRepository(Message).extend({
	async addMessage(message: Message): Promise<any> {
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
