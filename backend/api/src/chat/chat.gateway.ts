import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { SocketGuard } from '../user/guards/socketAuth.guard'
import { AddMessageDto, CreateChatRoomDto } from './dto/chat-property.dto'
import { ChatService } from './chat.service'
import { Message } from './entities/message.entity'
import { ChatRoom } from './entities/chat-room.entity'
import { WsException } from '@nestjs/websockets'

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway {
	@WebSocketServer()
	server: Server

	constructor(private readonly chatService: ChatService) {}

	private logger: Logger = new Logger('ChatGateway')

	async handleConnection(@ConnectedSocket() socket: Socket) {
		this.chatService.setUserToSocket(socket)
		this.logger.log(`Client connected: ${socket.id}`)
	}

	/* add new message to the selected channel */
	@UseGuards(SocketGuard)
	@SubscribeMessage('addMessage')
	async handleMessage(
		@MessageBody() addMessageDto: AddMessageDto,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`addMessage: recieved ${addMessageDto.message}`)
		const room = [...socket.rooms].slice(0)[1]
		const newMessage = await this.chatService.addMessage(
			addMessageDto,
			socket.data.userId,
			room,
		)
		console.log(socket.data.userId)
		this.server.to(room).emit('updateNewMessage', newMessage)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('addAdmin')
	async addAdmin(
		@MessageBody() userId: string,
		@ConnectedSocket() socket: Socket,
	) {
		const room = [...socket.rooms].slice(0)[1]
		this.logger.log(`addAdmin: recieved [${userId}] to room[${room}]`)
		const newRoom = await this.chatService.addAdmin(userId, room)
		//update the channel info
		this.updateRoom(newRoom)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('banMember')
	async banUser(
		@MessageBody() userId: string,
		@ConnectedSocket() socket: Socket,
	) {
		const room = [...socket.rooms].slice(0)[1]
		this.logger.log(`banUser: recieved [${userId}] to room[${room}]`)
		const newRoom = await this.chatService.banUser(userId, room)
		//update the channel info
		this.updateRoom(newRoom)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('muteMember')
	async muteUser(
		@MessageBody() userId: string,
		@ConnectedSocket() socket: Socket,
	) {
		const room = [...socket.rooms].slice(0)[1]
		this.logger.log(`muteUser: recieved [${userId}] to room[${room}]`)
		const newRoom = await this.chatService.muteUser(userId, room)
		//update the channel info
		this.updateRoom(newRoom)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('getMessageLog')
	async getMessageLog(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`getMessageLog: for ${roomId}`)
		const messageLog = await this.chatService.getMessageLog(roomId)
		socket.emit('getMessageLog', messageLog)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('getRooms')
	async getRooms(@ConnectedSocket() socket: Socket) {
		this.logger.log(`getRooms: for ${socket.id}`)
		const rooms = await this.chatService.getRooms()
		socket.emit('getRooms', rooms)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('getMembers')
	async getMembers(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`getMembers: for ${socket.id}`)
		const users = await this.chatService.getMembers(roomId)
		socket.emit('getMembers', users)
	}

	// room which user is watching
	@UseGuards(SocketGuard)
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
	@UseGuards(SocketGuard)
	@SubscribeMessage('joinRoom')
	async joinAndUpdateRoom(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		//banの場合
		const tmp = await this.chatService.findRoom(roomId)
		if (tmp.banned.indexOf(socket.data.userId) != -1) {
			throw new WsException('You are banned from the channel')
		}

		//privateの場合


		//publicの場合
		const room = await this.joinRoom(roomId, socket)
		this.updateRoom(room)
	}

	/* also join to a created room. Frontend has to update the room to newly returned room*/
	@UseGuards(SocketGuard)
	@SubscribeMessage('createRoom')
	async createRoom(
		@MessageBody() createChatRoomDto: CreateChatRoomDto,
		@ConnectedSocket() socket: Socket,
	) {
		let newChatRoom = await this.chatService.createRoom(
			createChatRoomDto,
			socket.data.userId,
		)
		newChatRoom = await this.joinRoom(newChatRoom.id, socket)
		this.logger.log(newChatRoom)
		this.server.emit('updateRoom', newChatRoom)
		this.server.to(socket.id).emit('updateCurrentRoom', newChatRoom.id)
		this.getMessageLog(newChatRoom.id, socket)
	}

	async joinRoom(roomId: string, socket: Socket) {
		this.logger.log(`joinRoom: ${socket.id} watched ${roomId}`)
		this.watchOrSwitchRoom(roomId, socket)
		const room: ChatRoom = await this.chatService.joinRoom(
			socket.data.userId,
			roomId,
		)
		return room
	}

	async updateRoom(room: ChatRoom) {
		this.server.to(room.id).emit('updateRoom', room)
	}
}

// handleDisconnect(@ConnectedSocket() socket: Socket) {
//   //クライアント切断時
//   this.logger.log(`Client disconnected: ${socket.id}`);
// }
