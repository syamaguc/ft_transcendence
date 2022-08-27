import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { MessageI } from "../interface/message.interface"

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

    @Column('simple-array', { default: [] })
    logs: MessageI[]

    @Column('text', { default: '' })
    password: string
}
