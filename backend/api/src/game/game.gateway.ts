import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets'
import {
	Logger,
	NotFoundException,
	InternalServerErrorException,
} from '@nestjs/common'
import { UseGuards } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { User } from '../user/entities/user.entity'
import { UsersRepository } from '../user/user.repository'
import { SocketGuard } from '../user/guards/socketAuth.guard'
import { GameRoom, GameRoomDict } from './game.lib'
import {
	SocketData,
	KeyStatus,
	GameSetting,
	GameStatus,
	UserDict,
	InviteDict,
	GameObject,
} from './game.interface'
import { UserStatus } from 'src/user/interfaces/user-status.enum'

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
	@WebSocketServer()
	private server: Server
	private gameRooms: GameRoomDict = {}
	private matchUsers: SocketData[] = []
	private inviteUsers: InviteDict = {}
	private logger: Logger = new Logger('Gateway Log')
	private socketDatas: UserDict = {}

	removeInvitedUser(userId: string) {
		// 修正予定
		delete this.inviteUsers[userId]
	}

	removeMatchingUser(userId: string) {
		for (let i = 0; i < this.matchUsers.length; i++) {
			if (userId == this.matchUsers[i].userId) {
				this.matchUsers.splice(i, 1)
				return
			}
		}
	}

	removeInviteUser(socketData: SocketData) {
		// 修正予定
		const removeArray = []
		for (let key in this.inviteUsers) {
			const socketDatas = this.inviteUsers[key]
			for (let i = 0; i < socketDatas.length; i++) {
				if (socketData.userId == socketDatas[i].userId) {
					socketDatas.splice(i, 1)
					if (socketDatas.length == 0) {
						removeArray.push(key)
					}
					return
				}
			}
		}
		for (let i = 0; i < removeArray.length; i++) {
			this.removeInvitedUser(removeArray[i])
		}
	}

	removeWatchUser(socketData: SocketData) {
		if (!(socketData.gameId in this.gameRooms)) return
		const gameRoom = this.gameRooms[socketData.gameId]
		gameRoom.removeNotPlayer(socketData.userId)
	}

	removeSocketDataFromArray(socketData: SocketData) {
		if (socketData.status == GameStatus.Matching) {
			this.removeMatchingUser(socketData.userId)
		} else if (socketData.status == GameStatus.Invite) {
			this.removeInviteUser(socketData)
		} else if (socketData.status == GameStatus.Watch) {
			this.removeWatchUser(socketData)
		}
		return socketData
	}

	compareAndUpdateSocket(socketData: SocketData, newSocket: Socket) {
		if (socketData.client.id != newSocket.id) {
			if (socketData.client.connected) {
				socketData.client.disconnect()
			}
			socketData.client = newSocket
		}
		return socketData
	}

	prepareNewStatus(socket: Socket, newStatus: GameStatus) {
		const userId = socket.data.userId
		console.log(userId)
		console.log(socket.data.username)
		if (!(userId in this.socketDatas)) {
			const socketData = {
				client: socket,
				role: -1,
				userId: userId,
				userName: socket.data.username,
				status: newStatus,
				gameId: ''
			}
			this.socketDatas[userId] = socketData
			return socketData
		}
		let socketData = this.socketDatas[userId]
		socketData = this.removeSocketDataFromArray(socketData)
		socketData = this.compareAndUpdateSocket(socketData, socket)
		return socketData
	}

	removeDisconnectMatchUser() {
		const removeArray = []
		for (let i = 0; i < this.matchUsers.length; i++) {
			if (!this.matchUsers[i].client.connected) {
				removeArray.push({index: i, userId: this.matchUsers[i].userId})
			}
		}
		for (let i = removeArray.length - 1; i >= 0; i--) {
			this.matchUsers.splice(removeArray[i].index, 1)
			delete this.socketDatas[removeArray[i].userId]
		}
	}

	removeDisconnectInviteUser() {
		const removeKeyArray = []
		for (let key in this.inviteUsers) {
			const socketDatas = this.inviteUsers[key]
			const removeArray = []
			for (let i = 0; i < socketDatas.length; i++) {
				if (!socketDatas[i].client.connected) {
					removeArray.push({index: i, userId: socketDatas[i].userId})
				}
			}
			for (let i = removeArray.length - 1; i >= 0; i--) {
				socketDatas.splice(removeArray[i].index, 1)
				delete this.socketDatas[removeArray[i].userId]
			}
			if (socketDatas.length == 0) {
				removeKeyArray.push(key)
			}
		}
		for (let i = 0; i < removeKeyArray.length; i++) {
			delete this.inviteUsers[removeKeyArray[i]]
		}
	}

	removeDisconnectWatchUser() {
		for (let gameId in this.gameRooms) {
			const gameRoom = this.gameRooms[gameId]
			const removeArray = gameRoom.removeDisconnectNotPlayer()
			for (let i = 0; i < removeArray.length; i++) {
				delete this.socketDatas[removeArray[i]]
			}
		}
	}

	async updateGameStatus(userId: string, inGame: boolean) {
		let userFound: User = undefined
		userFound = await UsersRepository.findOne({
			where: { userId: userId },
		})
		userFound.status = inGame ? UserStatus.INGAME : UserStatus.ONLINE
		try {
			await UsersRepository.save(userFound)
		} catch (e) {
			console.log(e)
			throw new InternalServerErrorException()
		}
	}

	updateGameStatusRoom(roomId: string, inGame: boolean) {
		if (!(roomId in this.gameRooms)) return
		const player1Id = this.gameRooms[roomId].player1Id
		const player2Id = this.gameRooms[roomId].player2Id
		Promise.all([
			this.updateGameStatus(player1Id, inGame),
			this.updateGameStatus(player2Id, inGame),
		])
			.then(() => {
				this.logger.log('update game status: ', player1Id, player2Id)
			})
			.catch(() => {
				this.logger.log(
					'update game status error: ',
					player1Id,
					player2Id,
				)
			})
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('connectGame')
	handleConnect(@MessageBody() data, @ConnectedSocket() client: Socket) {
		const roomId = data['roomId']
		const socketData: SocketData = this.prepareNewStatus(client, GameStatus.Watch)
		const userId = client.data.userId

		if (!(roomId in this.gameRooms)) {
			this.server.to(client.id).emit('noRoom')
			client.disconnect()
			if (socketData.status != GameStatus.Game) {
				delete this.socketDatas[userId]
			}
			return
		}
		const gameRoom = this.gameRooms[roomId]

		if (socketData.status == GameStatus.Game) {
			if (socketData.gameId == roomId) {
				client.join(roomId)
			} else {
				throw new WsException('Get back to your own game.')
			}
		} else {
			gameRoom.addWatcher(socketData)
		}
		this.server.to(client.id).emit('connectClient', {
			role: socketData.role,
			gameObject: gameRoom.gameObject,
		})
	}

	@SubscribeMessage('settingChange')
	handleSettingChange(@MessageBody() data: any) {
		const roomId = data['id']
		const name = data['name']
		const checked = data['checked']
		const value = data['value']
		if (!(roomId in this.gameRooms)) return
		this.gameRooms[roomId].settingChange(name, checked, value)
	}

	makeGameRoom(
		player1: SocketData,
		player2: SocketData,
		gameSetting?: GameSetting,
	): string {
		const id = uuidv4()
		const gameRoom = new GameRoom(id, this.server, player1, player2)
		if (gameSetting) {
			gameRoom.gameObject.gameSetting = gameSetting
		}
		gameRoom.settingStart(this)
		this.gameRooms[id] = gameRoom
		gameRoom.emitGameRoomInfo()
		return id
	}

	deleteGameRoom(roomId: string, userRemoveFlag: boolean = true) {
		this.gameRooms[roomId].disconnectAll()
		if (userRemoveFlag) {
			const removeUsers = []
			for (let userId in this.gameRooms[roomId].socketDatas) {
				if (!(userId in this.socketDatas)) return
				const socketData = this.socketDatas[userId]
				if (socketData.gameId == roomId) {
					removeUsers.push(userId)
				}
			}
			for (let i = 0; i < removeUsers.length; i++) {
				delete this.socketDatas[removeUsers[i]]
			}
		}
		delete this.gameRooms[roomId]
		this.server
			.to('readyIndex')
			.emit('deleteGameRoom', { gameRoomId: roomId })
	}

	settingEnd(gameRoomId: string) {
		this.updateGameStatusRoom(gameRoomId, false)
		if (!(gameRoomId in this.gameRooms)) return
		this.gameRooms[gameRoomId].quit()
		this.deleteGameRoom(gameRoomId)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('start')
	handleStart(@MessageBody() data: any) {
		const roomId = data['id']
		const point = data['point']
		const speed = data['speed']
		if (!(roomId in this.gameRooms)) return
		this.gameRooms[roomId].start(point, speed)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('retry')
	handleRetry(@MessageBody() data: any) {
		const roomId = data['id']
		const userId = data['userId']
		if (!(roomId in this.gameRooms)) return
		const [gameObject, player1, player2]: [GameObject, SocketData, SocketData] =
			this.gameRooms[roomId].retry(userId)
		if (!gameObject.retryFlag.player1 || !gameObject.retryFlag.player2) {
			return
		}
		const socketDatas = this.gameRooms[roomId].socketDatas
		this.deleteGameRoom(roomId, false)
		const newRoomId = this.makeGameRoom(
			player1,
			player2,
			gameObject.gameSetting,
		)
		for (let key in socketDatas) {
			socketDatas[key].gameId = newRoomId
			this.server
				.to(socketDatas[key].client.id)
				.emit('goNewGame', newRoomId)
		}
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('retryCancel')
	handleRetryCancel(@MessageBody() data: any) {
		const roomId = data['id']
		const userId = data['userId']
		if (!(roomId in this.gameRooms)) return
		this.gameRooms[roomId].retryCancel(userId)
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('quit')
	handleQuit(@MessageBody() data: any) {
		const roomId = data['id']
		if (!(roomId in this.gameRooms)) return
		this.updateGameStatusRoom(roomId, false)
		this.gameRooms[roomId].quit()
		this.deleteGameRoom(roomId)
	}

	@SubscribeMessage('move')
	handleMove(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const roomId = data['id']
		const keyStatus: KeyStatus = data['key']
		if (!(roomId in this.gameRooms)) return
		this.gameRooms[roomId].barSelect(keyStatus, client)
	}

	makeGameRoomInfos() {
		const gameRoomInfos = []
		for (let key in this.gameRooms) {
			gameRoomInfos.push(this.gameRooms[key].makeGameRoomInfo)
		}
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('readyGameIndex')
	handleReadyGameIndex(
		@ConnectedSocket() client: Socket,
	) {
		let status = 0
		const socketData: SocketData = this.prepareNewStatus(client, GameStatus.MatchReady)

		const gameId = socketData.status == GameStatus.Game ? socketData.gameId : null
		if (gameId) {
			status = 2
		}

		this.server.to(client.id).emit('setFirstGameRooms', {
			gameRooms: this.makeGameRoomInfos(),
			status: status,
			gameRoomId: gameId,
		})
		client.join('readyIndex')
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('registerMatch')
	handleRegisterMatch(
		@ConnectedSocket() client: Socket,
	) {
		const socketData: SocketData = this.prepareNewStatus(client, GameStatus.Matching)

		if (socketData.status == GameStatus.Game) {
			throw new WsException('Cannot be matched because you are in the game')
		}

		this.removeDisconnectMatchUser()
		if (this.matchUsers.length >= 1) {
			this.matchUsers[0].role = 0
			this.matchUsers[0].status = GameStatus.Game
			socketData.role = 1
			socketData.status = GameStatus.Game
			const roomId = this.makeGameRoom(
				this.matchUsers[0],
				socketData,
			)
			this.matchUsers[0].gameId = roomId
			socketData.gameId = roomId
			this.updateGameStatusRoom(roomId, true)
			this.server.to(client.id).emit('goGameRoom', roomId)
			this.server
				.to(this.matchUsers[0].client.id)
				.emit('goGameRoom', roomId)
			this.matchUsers.splice(0, 1)
		} else {
			socketData.status = GameStatus.Matching
			this.matchUsers.push(socketData)
		}
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('cancelMatch')
	handleCancelMatch(
		@ConnectedSocket() client: Socket,
	) {
		const socketData: SocketData = this.prepareNewStatus(client, GameStatus.MatchReady)
		if (!(socketData.status in [GameStatus.MatchReady, GameStatus.Matching])) {
			throw new WsException('Please reload.')
		}
		socketData.status = GameStatus.MatchReady
	}
/*
	inInviteUsers(userId: string) {
		for (let i = 0; i < this.inviteUsers.length; i++) {
			if (this.inviteUsers[i].userId == userId) {
				return i
			}
		}
		return -1
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('gameInviteReady')
	handleGameInviteReady(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		
	}

	@UseGuards(SocketGuard)
	@SubscribeMessage('gameInvite')
	handleGameInvite(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.userId
		const userName = client.data.username
		const inviteUserId = data['inviteUserId']

		if (this.searchRoomFromUserId(userId)) {
			throw new WsException('Cannot be invited because you are participating or watching the game')
		}
		if (this.checkInMatchUsers(userId) != -1) {
			throw new WsException('Cannot invite due to matching in progress')
		}

		const roomId = this.searchRoomFromUserId(inviteUserId)
		if (roomId) {
			this.server.to(client.id).emit('gameWatch', {roomId: roomId})
		} else {
			const inviteUserIndex = this.inInviteUsers(userId)
			if (inviteUserIndex != -1) {
				this.inviteUsers[inviteUserId].client = client
			} else {
				const clientData: SocketData = {
					client: client,
					role: -1,
					userId: userId,
					userName: username,
				}
				this.inviteUsers.push(clientData)
			}
		}
	}
*/
}
