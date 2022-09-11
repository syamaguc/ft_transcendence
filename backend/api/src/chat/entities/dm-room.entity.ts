import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { MessageI } from '../interface/message.interface'

@Entity()
export class DMRoom {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column('simple-array', { default: [] })
	members: string[]

	@Column('simple-array', { default: [] })
	logs: MessageI[]
}
