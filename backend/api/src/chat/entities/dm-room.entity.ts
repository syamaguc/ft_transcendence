import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Message } from './message.entity'

@Entity()
export class DMRoom {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('uuid')
	memberA: string

	@Column('uuid')
	memberB: string

	@OneToMany(() => Message, (msg) => msg.room)
	messages: Message[]

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	time_created: Date
}
