import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm'
import { ChatRoom } from './chat-room.entity'

@Entity()
export class Message {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('uuid')
	userId: string

	@Column()
	message: string

	@Column()
	timestamp: Date

	@ManyToOne(() => ChatRoom, (room) => room.messages, {
		cascade: true,
	})
	room: ChatRoom
}
