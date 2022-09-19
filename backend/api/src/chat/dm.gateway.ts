import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { AddMessageDto } from './dto/chat-property.dto'
import { DMService } from './dm.service'
import { ChatService } from './chat.service'

@WebSocketGateway({ namespace: '/dm', cors: { origin: '*' } })
export class DMGateway {
	@WebSocketServer()
	server: Server

	constructor(
		private readonly DMService: DMService,
		private readonly ChatService: ChatService,
	) {}

	private logger: Logger = new Logger('DMGateway')

	async handleConnection(@ConnectedSocket() socket: Socket) {
		this.ChatService.setUserToSocket(socket)
		this.logger.log(`Client connected: ${socket.id}`)
	}

	/* add new message to the selected channel */
	@SubscribeMessage('addMessage')
	async handleMessage(
		@MessageBody() addMessageDto: AddMessageDto,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`addMessage: recieved ${addMessageDto.message}`)
		const room = [...socket.rooms].slice(0)[1]
		const newMessage = await this.DMService.addMessage(
			addMessageDto,
			socket.data.userId,
			room,
		)
		this.server.to(room).emit('updateNewMessage', newMessage)
	}

	@SubscribeMessage('getMessageLog')
	async getMessageLog(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`getMessageLog: for ${roomId}`)
		const messageLog = await this.DMService.getMessageLog(roomId)
		socket.emit('getMessageLog', messageLog)
	}

	@SubscribeMessage('getRooms')
	async getRooms(@ConnectedSocket() socket: Socket) {
		this.logger.log(`getRooms: for ${socket.data.userId}`)
		const rooms = await this.DMService.getRooms(socket.data.userId)
		socket.emit('getRooms', rooms)
	}

	// room which user is watching
	@SubscribeMessage('watchRoom')
	async watchOrSwitchRoom(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`watchRoom: ${socket.id} watched ${roomId}`)
		const rooms = [...socket.rooms].slice(0)
		if (rooms.length == 2) socket.leave(rooms[1])
		socket.join(roomId)
		const room = await this.DMService.getRoom(roomId)
		socket.emit('watchRoom', room)
	}

	/* also join to a created room. Frontend has to update the room to newly returned room*/
	@SubscribeMessage('createRoom')
	async createRoom(
		@MessageBody() username: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`createRoom called for ${username}`)
		const selfUserId = socket.data.userId
		const userId = await this.DMService.getUserIdByUsername(username)
		let room = await this.DMService.getRoomByUserIds(userId, selfUserId)
		if (!room) {
			room = await this.DMService.createRoomByUserIds(userId, selfUserId)
		}
		newDMRoom = { ...newDMRoom, user2: socket.data.username }
		socket.emit('updateRoom', newDMRoom)
		this.notifyAddRoomToUser(socket, newDMRoom.user1, newDMRoom)
	}

	@SubscribeMessage('getRoomIdByUserIds')
	async getRoomIdByUserIds(
		@MessageBody() userId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`getRoom: for ${socket.data.userId} and ${userId}`)
		const room = await this.DMService.getRoomByUserIds(
			socket.data.userId,
			userId,
		)
		if (!room) {
			let newDMRoom = await this.DMService.createRoomByUserIds(
				userId,
				socket.data.userId,
			)
			socket.emit('getRoomIdByUserIds', newDMRoom.id)
			this.notifyAddRoomToUser(socket, userId, newDMRoom)
			return
		}
		socket.emit('getRoomIdByUserIds', room.id)
	}

	notifyAddRoomToUser(socket: Socket, userId: string, newDMRoom: any) {
		this.logger.log('notifyAddRoomToUser called')
		if (socket.nsp.sockets) {
			socket.nsp.sockets.forEach((value: Socket) => {
				if (value.data.userId == userId) {
					console.log(value)
					value.emit('addRoom', newDMRoom)
				}
			})
		}
	}
}

// handleDisconnect(@ConnectedSocket() socket: Socket) {
//   //クライアント切断時
//   this.logger.log(`Client disconnected: ${socket.id}`);
// }
