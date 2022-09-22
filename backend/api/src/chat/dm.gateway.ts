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
import { DMObject, DMRawData } from './interfaces/dm.interface'
import { DMRoom } from './entities/dm-room.entity'

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
		const clientUserId = socket.data.userId
		const rooms = await this.DMService.getRoomsByUserId(clientUserId)
		let DMObjectsForFront: DMObject[] = []
		rooms.map((room) => {
			DMObjectsForFront.push(
				this.createDMObjectForFront(room, clientUserId),
			)
		})
		socket.emit('getRooms', DMObjectsForFront)
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
		const DMObjectForFront: DMObject = this.createDMObjectForFront(
			room,
			socket.data.userId,
		)
		socket.emit('watchRoom', DMObjectForFront)
	}

	/* also join to a created room. Frontend has to update the room to newly returned room*/
	@SubscribeMessage('createRoom')
	@UseGuards(SocketGuard)
	async createRoom(
		@MessageBody() username: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.logger.log(`createRoom called for ${username}`)
		const clientUserId = socket.data.userId
		const userId: string = await this.DMService.getUserIdByUsername(
			username,
		)
		const existingRoom: DMRoom = await this.DMService.getRoomByUserIds(
			userId,
			clientUserId,
		)
		if (existingRoom) {
			const DMRoom: DMRawData = await this.DMService.getRoomByRoomId(
				existingRoom.id,
			)
			const DMObjectForFront: DMObject = this.createDMObjectForFront(
				DMRoom,
				clientUserId,
			)
			socket.emit('updateRoom', DMObjectForFront)
			return
		}
		const createdRoom: DMRoom = await this.DMService.createRoomByUserIds(
			userId,
			clientUserId,
		)
		const newDMRoom: DMRawData = await this.DMService.getRoomByRoomId(
			createdRoom.id,
		)
		const DMObjectForClient: DMObject = this.createDMObjectForFront(
			newDMRoom,
			clientUserId,
		)
		socket.emit('updateRoom', DMObjectForClient)
		const DMObjectForOther: DMObject = this.createDMObjectForFront(
			newDMRoom,
			userId,
		)
		this.sendAddRoomByUserId(socket, userId, DMObjectForOther)
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
		const clientUserId = socket.data.userId
		let room = await this.DMService.getRoomByUserIds(clientUserId, userId)
		if (!room) {
			room = await this.DMService.createRoomByUserIds(
				userId,
				clientUserId,
			)
			const newDMRoom: DMRawData = await this.DMService.getRoomByRoomId(
				room.id,
			)
			const DMObjectForFront: DMObject = this.createDMObjectForFront(
				newDMRoom,
				userId,
			)
			this.sendAddRoomByUserId(socket, userId, DMObjectForFront)
		}
		socket.emit('getRoomIdByUserIds', room.id)
	}

	sendAddRoomByUserId(socket: Socket, userId: string, newDMRoom: DMObject) {
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

	createDMObjectForFront(room: DMRawData, userIdToSend: string): DMObject {
		let name = room.user1
		let userId = room.user1id
		if (userId === userIdToSend) {
			name = room.user2
			userId = room.user2id
		}
		const DMObjectForFront: DMObject = {
			id: room.id,
			name,
			userId,
		}
		console.log(userId, room, DMObjectForFront)
		return DMObjectForFront
	}
}

// handleDisconnect(@ConnectedSocket() socket: Socket) {
//   //クライアント切断時
//   this.logger.log(`Client disconnected: ${socket.id}`);
// }
