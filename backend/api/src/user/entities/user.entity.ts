import { IsAlphanumeric, IsEmail } from 'class-validator'
import { UserStatus } from '../interfaces/user-status.enum'
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	IsNull,
	ManyToMany,
	OneToMany,
	JoinColumn,
	JoinTable,
} from 'typeorm'
import { GameHistory } from '../../game/entities/gameHistory.entity'

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	userId: string

	@IsAlphanumeric()
	@Column({ unique: true })
	username: string

	@IsEmail()
	@Column({ unique: true })
	email: string

	@Column()
	password: string

	@Column('text', { default: 'empty' })
	profile_picture: string

	@Column('int', { default: 1 })
	login_count: number

	@Column('int', { default: 1000 })
	elo: number

	@Column('int', { default: 0 })
	game_won: number

	@Column('int', { default: 0 })
	lost_game: number

	@Column('int', { default: 0 })
	numberOfParty: number

	@Column('int', { default: 0 })
	ratio: number

	@Column('text', { default: 'Online' })
	status: UserStatus

	@Column('date', { default: () => '((CURRENT_DATE))' })
	sign_up_date: Date

	@Column('simple-array')
	friends: string[]

	@Column('text', { default: '' })
	login42: string

	@Column('boolean', { default: false })
	twoFactorAuth: boolean

	@Column('boolean', { default: false })
	isBan: boolean

	@Column('boolean', { default: false })
	isAdmin: boolean

	@Column('simple-array', { default: [] })
	blockedUsers: string[]

	// for gameHistory
	@ManyToMany(() => GameHistory, (gameHistory) => gameHistory.users, {
		eager: true,
	})
	@JoinTable()
	game_history: GameHistory[]
}
