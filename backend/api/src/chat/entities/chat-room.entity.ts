import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
// import { MessageI } from "../interface/message.interface"
import { Message } from './message.entity'

@Entity()
export class ChatRoom {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('text', { default: '' })
	name: string

	@Column('simple-array', { default: [] })
	members: string[]

	@Column()
	owner: string

	@Column('simple-array', { default: [] })
	admins: string[]

	@Column('boolean', { default: false })
	is_private: boolean

	// @Column('simple-array', { default: [] })
	// logs: MessageI[]

	@OneToMany(() => Message, (msg) => msg.room)
	messages: Message[]

	@Column('text', { default: '' })
	password: string
}
