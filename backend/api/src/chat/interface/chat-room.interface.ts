import { MessageI } from './message.interface';

export interface ChatRoomI {
	id: string;
	name: string;
	owner: string;
	admins: string[];
	is_private: boolean;
	channel_type: string;
	logs: MessageI[];
}
