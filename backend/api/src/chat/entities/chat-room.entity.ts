import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
// import { MessageI } from "../interface/message.interface"
import { Message } from './message.entity'
import {
	IsNotEmpty,
	MinLength,
	MaxLength,
	IsAlphanumeric,
} from 'class-validator'

@Entity()
export class ChatRoom {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@IsNotEmpty()
	@IsAlphanumeric()
	@Column('text', { default: '' })
	name: string

	@Column('text', { array: true, default: {} })
	members: string[]

	@Column()
	owner: string

	@Column('text', { array: true, default: {} })
	admins: string[]

	@Column('text', { array: true, default: {} })
	banned: string[]

	@Column('text', { array: true, default: {} })
	muted: string[]

	@Column('boolean', { default: false })
	is_private: boolean

	@OneToMany(() => Message, (msg) => msg.room)
	messages: Message[]

	@Column('text', { default: '' })
	password: string

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	time_created: Date

	// @Column()
	// time_updated: Date

	// @Column()
	// type: string
}
