import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
// import { MessageI } from "../interface/message.interface"
import { Message } from './message.entity'

@Entity()
export class ChatRoom {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('text', { default: '' })
	name: string

	@Column('text', { array: true, default: {} })
	members: string[]

	@Column()
	owner: string

	@Column('text', { array: true, default: {} })
	admins: string[]

	@Column('boolean', { default: false })
	is_private: boolean

	@OneToMany(() => Message, (msg) => msg.room)
	messages: Message[]

	@Column('text', { default: '' })
	password: string

	@Column()
	time_created: Date

	// @Column()
	// time_updated: Date

	// @Column()
	// type: string
}
