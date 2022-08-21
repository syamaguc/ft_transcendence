import { MessageI } from './message.interface';

export interface ChatRoomI {
	id: string;
	name: string;
	members: string[];
	owner: string;
	admins: string[];
	is_private: boolean;
	channel_type: string;
	logs: MessageI[];
}
