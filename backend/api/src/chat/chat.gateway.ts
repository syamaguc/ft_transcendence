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
import { MessageI } from './interface/message.interface'
import { ChatRoomI } from './interface/chat-room.interface'

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
	@WebSocketServer()
	server: Server

	constructor(private readonly chatService: ChatService) {}

	private logger: Logger = new Logger('ChatGateway')

	/* add new message to the selected channel */
	@SubscribeMessage('addMessage')
	handleMessage(
		// @MessageBody() addMessageDto: AddMessageDto,
		@MessageBody() message: string,
		@ConnectedSocket() socket: Socket,
	) {
		const addMessageDto: AddMessageDto = {
			message: message,
			user: 'none',
		}
		this.logger.log(`addMessage: recieved ${addMessageDto.message}`)
		const room = [...socket.rooms].slice(0)[1]
		const newMessage = this.chatService.addMessage(addMessageDto, room)
		this.server.to(room).emit('updateNewMessage', newMessage.message)
	}

	@SubscribeMessage('getMessageLog')
	getMessageLog(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`getMessageLog: for ${roomId}`)
		const messageLog: MessageI[] = this.chatService.getMessageLog(roomId)
		const messageStrings: string[] = []
		messageLog.map((log) => messageStrings.push(log.message))
		socket.emit('getMessageLog', messageStrings)
	}

	@SubscribeMessage('getRooms')
	getRooms(@ConnectedSocket() socket: Socket) {
		this.logger.log(`getRooms: for ${socket.id}`)
		const rooms: ChatRoomI[] = this.chatService.getRooms()
		//tmp
		const roomsList = []
		rooms.map((r) => roomsList.push({ id: r.id, name: r.name }))
		socket.emit('getRooms', roomsList)
	}

	// room which user is watching
	@SubscribeMessage('watchRoom')
	watchOrSwitchRoom(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`watchRoom: ${socket.id} watched ${roomId}`)
		const rooms = [...socket.rooms].slice(0)
		if (rooms.length == 2) socket.leave(rooms[1])
		socket.join(roomId)
	}

	// join room to be a member
	@SubscribeMessage('joinRoom')
	joinRoom(@MessageBody() roomId: string, @ConnectedSocket() socket: Socket) {
		this.logger.log(`joinRoom: ${socket.id} watched ${roomId}`)
		this.chatService.joinRoom(roomId)
		this.watchOrSwitchRoom(roomId, socket)
	}

	/* also join to a created room. Frontend has to update the room to newly returned room*/
	@SubscribeMessage('createRoom')
	createRoom(
		// @MessageBody() createChatRoomDto: CreateChatRoomDto,
		@MessageBody() chatname: string,
		@ConnectedSocket() socket: Socket,
	) {
		const createChatRoomDto: CreateChatRoomDto = {
			name: chatname,
			owner: 'none',
			is_private: false,
			channel_type: 'channel',
		}
		const newChatRoom = this.chatService.createRoom(createChatRoomDto)
		this.joinRoom(newChatRoom.id, socket)
		const chatRoom = { id: newChatRoom.id, name: newChatRoom.name }
		this.server.emit('updateNewRoom', chatRoom)
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
