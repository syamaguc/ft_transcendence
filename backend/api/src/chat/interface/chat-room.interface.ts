import { MessageI } from './message.interface'

export interface ChatRoomI {
	id: string
	name: string
	members: string[]
	owner: string
	admins: string[]
	is_private: boolean
	logs: MessageI[]
	password: string //cryto
}

export interface DMRoomI {
	id: string
	members: string[]
	logs: MessageI[]
}
