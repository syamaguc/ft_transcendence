import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm'
import { ChatRoom } from './chat-room.entity'
import { DMRoom } from './dm-room.entity'

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
		onDelete: 'CASCADE',
		nullable: true,
	})
	room: ChatRoom

	@ManyToOne(() => DMRoom, (DMroom) => DMroom.messages, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	DMroom: DMRoom
}
