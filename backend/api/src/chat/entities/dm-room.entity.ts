import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { Message } from './message.entity'

@Entity()
export class DMRoom {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('simple-array', { default: [] })
	members: string[]

	@Column('simple-array', { default: [] })
	logs: Message[]
}
