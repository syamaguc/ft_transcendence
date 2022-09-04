import { DataSource } from 'typeorm'
import { User } from '../user/entities/user.entity'
import { GameHistory } from '../game/entities/gameHistory.entity'

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'postgres',
	port: 5432,
	username: 'root',
	password: 'password',
	database: 'ft_transcendence',
	synchronize: true,
	logging: true,
	entities: [User, GameHistory],
	subscribers: [],
	migrations: [],
})
