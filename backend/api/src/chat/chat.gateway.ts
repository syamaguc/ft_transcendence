import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { AddMessageDto, CreateChatRoomDto } from './dto/chat-property.dto'
import { ChatService } from './chat.service'
import { Message } from './entities/message.entity'

type Tmp = {
	userId: string
	roomId: string
}

@WebSocketGateway({
	namespace: '/chat',
	cors: { origin: '*' },
})
export class ChatGateway {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService) {}

	private logger: Logger = new Logger('ChatGateway');

	/* add new message to the selected channel */
	@SubscribeMessage('addMessage')
	async handleMessage(
		@MessageBody() addMessageDto: AddMessageDto,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`addMessage: recieved ${addMessageDto.message}`)
		const room = [...socket.rooms].slice(0)[1]
		addMessageDto.user = socket.data.userId
		const newMessage = await this.chatService.addMessage(
			addMessageDto,
			room,
		)
		this.server.to(room).emit('updateNewMessage', newMessage)
	}

	@SubscribeMessage('getMessageLog')
	async getMessageLog(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`getMessageLog: for ${roomId}`);
		const messageLog: Message[] = await this.chatService.getMessageLog(roomId);
		socket.emit('getMessageLog', messageLog);
	}

	@SubscribeMessage('getRooms')
	async getRooms(@ConnectedSocket() socket: Socket) {
		this.logger.log(`getRooms: for ${socket.id}`);
		const rooms = await this.chatService.getRooms();
		//tmp
		const roomsList = [];
		rooms.map((r) => roomsList.push({ id: r.id, name: r.name }));
		socket.emit('getRooms', roomsList);
	}

	// room which user is watching
	@SubscribeMessage('watchRoom')
	watchOrSwitchRoom(
		@MessageBody() payload: Tmp,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`watchRoom: ${socket.id} watched ${payload.roomId}`)
		if (!socket.data.userId) socket.data.userId = payload.userId
		const rooms = [...socket.rooms].slice(0)
		if (rooms.length == 2) socket.leave(rooms[1])
		socket.join(payload.roomId)
	}

	// join room to be a member
	@SubscribeMessage('joinRoom')
	joinRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
		this.logger.log(`joinRoom: ${socket.id} watched ${roomId}`);
		this.chatService.joinRoom(roomId);
		this.watchOrSwitchRoom({ roomId, userId: '' }, socket)
	}

	/* also join to a created room. Frontend has to update the room to newly returned room*/
	@SubscribeMessage('createRoom')
	async createRoom(
		@MessageBody() createChatRoomDto: CreateChatRoomDto,
		@ConnectedSocket() socket: Socket,
	) {
		const newChatRoom = await this.chatService.createRoom(createChatRoomDto);
		this.joinRoom(newChatRoom.id, socket);
		this.logger.log(newChatRoom);
		this.server.emit('updateNewRoom', newChatRoom);
	}
}

// handleConnection(@ConnectedSocket() socket: Socket) {
//   //クライアント接続時
//   this.logger.log(`Client connected: ${socket.id}`);
// }

// handleDisconnect(@ConnectedSocket() socket: Socket) {
//   //クライアント切断時
//   this.logger.log(`Client disconnected: ${socket.id}`);
// }
