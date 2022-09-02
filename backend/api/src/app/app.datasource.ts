import { ChatRoom } from 'src/chat/entities/chat-room.entity';
import { DMRoom } from 'src/chat/entities/dm-room.entity';
import { Message } from 'src/chat/entities/message.entity';
import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'postgres',
	port: 5432,
	username: 'root',
	password: 'password',
	database: 'ft_transcendence',
	synchronize: true,
	logging: true,
	entities: [User, ChatRoom, DMRoom, Message],
	subscribers: [],
	migrations: [],
});
