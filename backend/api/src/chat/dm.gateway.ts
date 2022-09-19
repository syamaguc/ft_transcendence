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
import { UseGuards } from '@nestjs/common'
import { SocketGuard } from 'src/user/guards/socketAuth.guard'

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
	@UseGuards(SocketGuard)
	async handleMessage(
		@MessageBody() addMessageDto: AddMessageDto,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`addMessage: recieved ${addMessageDto.message}`)
		const roomId = [...socket.rooms].slice(0)[1]
		const newMessage = await this.DMService.addMessageByRoomId(
			addMessageDto,
			socket.data.userId,
			roomId,
		)
		this.server.to(roomId).emit('updateNewMessage', newMessage)
	}

	@SubscribeMessage('getMessageLog')
	@UseGuards(SocketGuard)
	async getMessageLog(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`getMessageLog: for ${roomId}`)
		const messageLog = await this.DMService.getMessageLogByRoomId(roomId)
		socket.emit('getMessageLog', messageLog)
	}

	@SubscribeMessage('getRooms')
	@UseGuards(SocketGuard)
	async getRooms(@ConnectedSocket() socket: Socket) {
		this.logger.log(`getRooms: for ${socket.data.userId}`)
		const rooms = await this.DMService.getRoomsByUserId(socket.data.userId)
		socket.emit('getRooms', rooms)
	}

	// room which user is watching
	@SubscribeMessage('watchRoom')
	@UseGuards(SocketGuard)
	async watchOrSwitchRoom(
		@MessageBody() roomId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`watchRoom: ${socket.id} watched ${roomId}`)
		const rooms = [...socket.rooms].slice(0)
		if (rooms.length == 2) socket.leave(rooms[1])
		socket.join(roomId)
		const room = await this.DMService.getRoomByRoomId(roomId)
		socket.emit('watchRoom', room)
	}

	/* also join to a created room. Frontend has to update the room to newly returned room*/
	@SubscribeMessage('createRoom')
	@UseGuards(SocketGuard)
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
		const newDMRoom = await this.DMService.getRoomByRoomId(room.id)
		socket.emit('updateRoom', newDMRoom)
		this.sendAddRoomByUserId(socket, userId, newDMRoom)
	}

	@SubscribeMessage('getRoomIdByUserIds')
	@UseGuards(SocketGuard)
	async getRoomIdByUserIds(
		@MessageBody() userId: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(
			`getRoomIdByUserIds: for ${socket.data.userId} and ${userId}`,
		)
		let room = await this.DMService.getRoomByUserIds(
			socket.data.userId,
			userId,
		)
		if (!room) {
			room = await this.DMService.createRoomByUserIds(
				userId,
				socket.data.userId,
			)
			const newDMRoom = await this.DMService.getRoomByRoomId(room.id)
			this.sendAddRoomByUserId(socket, userId, newDMRoom)
		}
		socket.emit('getRoomIdByUserIds', room.id)
	}

	sendAddRoomByUserId(socket: Socket, userId: string, newDMRoom: any) {
		this.logger.log('sendAddRoomByUserId called')
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
