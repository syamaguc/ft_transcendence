import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets'
import { Logger, NotFoundException } from '@nestjs/common'
// import { Logger, NotFoundException, UseGuards } from '@nestjs/common'
// import { AuthGuard } from '@nestjs/passport'
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { User } from '../user/entities/user.entity'
import { UsersRepository } from '../user/user.repository'
// import { UserAuth } from '../user/guards/userAuth.guard'
import { GameRoom } from './game.lib'
import {
	socketData,
	KeyStatus,
	GameRoomInfo,
	GameSetting,
} from './game.interface'

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
	@WebSocketServer()
	private server: Server
	private gameRooms: GameRoom[] = []
	private gameRoomInfos: GameRoomInfo[] = []
	private matchUsers: socketData[] = []
	private logger: Logger = new Logger('Gateway Log')

	searchRoom(roomId: string) {
		for (let i = 0; i < this.gameRooms.length; i++) {
			if (roomId == this.gameRooms[i].id) {
				return i
			}
		}
		return -1
	}

	searchRoomFromUserId(userId: string) {
		for (let i = 0; i < this.gameRooms.length; i++) {
			if (this.gameRooms[i].inUser(userId)) {
				return this.gameRooms[i].id
			}
		}
		return null
	}

	async currentUser(userId: string): Promise<Partial<User>> {
		let userFound: User = undefined
		userFound = await UsersRepository.findOne({
			where: { userId: userId },
		})
		if (!userFound) throw new NotFoundException('No user found')
		const { password, ...res } = userFound
		this.logger.log(password)
		return res
	}

	@SubscribeMessage('connectServer')
	handleConnect(@MessageBody() data, @ConnectedSocket() client: Socket) {
		const roomId = data['roomId']
		const userId = data['userId']
		this.disconnectAllRooms(userId)
		const roomIndex = this.searchRoom(roomId)
		if (roomIndex == -1) {
			this.server.to(client.id).emit('noRoom')
		} else {
			const role: number = this.gameRooms[roomIndex].connect(
				client,
				userId,
			)
			this.server.to(client.id).emit('connectClient', {
				role: role,
				gameObject: this.gameRooms[roomIndex].gameObject,
			})
		}
	}

	@SubscribeMessage('settingChange')
	handleSettingChange(@MessageBody() data: any) {
		const roomId = data['id']
		const name = data['name']
		const checked = data['checked']
		const value = data['value']
		const roomIndex = this.searchRoom(roomId)
		if (roomIndex == -1) return
		this.gameRooms[roomIndex].settingChange(name, checked, value)
	}

	makeGameRoom(
		player1: socketData,
		player2: socketData,
		gameSetting?: GameSetting,
	): string {
		const id = uuidv4()
		this.disconnectAllRooms(player1.userId)
		this.disconnectAllRooms(player2.userId)
		const gameRoom = new GameRoom(id, this.server, player1, player2, this)
		if (gameSetting) {
			gameRoom.gameObject.gameSetting = gameSetting
		}
		this.gameRooms.push(gameRoom)
		const gameRoomInfo = {
			id: id,
			player1: {
				id: player1.userId,
				name: player1.userName,
			},
			player2: {
				id: player2.userId,
				name: player2.userName,
			},
		}
		this.gameRoomInfos.push(gameRoomInfo)
		this.server
			.to('readyIndex')
			.emit('addGameRoom', { gameRoom: gameRoomInfo })
		return id
	}

	deleteGameRoom(roomIndex: number) {
		this.gameRooms[roomIndex].disconnectAll()
		this.gameRooms.splice(roomIndex, 1)
		const gameRoomId: string = this.gameRoomInfos[roomIndex].id
		this.gameRoomInfos.splice(roomIndex, 1)
		this.server
			.to('readyIndex')
			.emit('deleteGameRoom', { gameRoomId: gameRoomId })
	}

	settingEnd(gameRoomId: string) {
		const roomIndex = this.searchRoom(gameRoomId)
		if (roomIndex == -1) return
		this.gameRooms[roomIndex].quit()
		this.deleteGameRoom(roomIndex)
	}

	@SubscribeMessage('start')
	handleStart(@MessageBody() data: any) {
		const roomId = data['id']
		const point = data['point']
		const speed = data['speed']
		const roomIndex = this.searchRoom(roomId)
		if (roomIndex == -1) return
		this.gameRooms[roomIndex].start(point, speed)
	}

	@SubscribeMessage('retry')
	handleRetry(@MessageBody() data: any) {
		const roomId = data['id']
		const userId = data['userId']
		const roomIndex = this.searchRoom(roomId)
		if (roomIndex == -1) return
		const [gameObject, player1, player2] =
			this.gameRooms[roomIndex].retry(userId)
		if (!gameObject.retryFlag.player1 || !gameObject.retryFlag.player2) {
			return
		}
		const socketDatas = this.gameRooms[roomIndex].socketDatas
		const gameRoomInfo = this.gameRoomInfos[roomIndex]
		this.deleteGameRoom(roomIndex)
		// 検索失敗時のエラー処理追加予定
		const newRoomId = this.makeGameRoom(
			player1,
			player2,
			gameObject.gameSetting,
		)
		for (let i = 0; i < socketDatas.length; i++) {
			this.server
				.to(socketDatas[i].client.id)
				.emit('goNewGame', newRoomId)
		}
	}

	@SubscribeMessage('retryCancel')
	handleRetryCancel(@MessageBody() data: any) {
		const roomId = data['id']
		const userId = data['userId']
		const roomIndex = this.searchRoom(roomId)
		if (roomIndex == -1) return
		this.gameRooms[roomIndex].retryCancel(userId)
	}

	@SubscribeMessage('quit')
	handleQuit(@MessageBody() data: any) {
		const roomId = data['id']
		const roomIndex = this.searchRoom(roomId)
		if (roomIndex == -1) return
		this.gameRooms[roomIndex].quit()
		this.deleteGameRoom(roomIndex)
	}

	@SubscribeMessage('move')
	handleMove(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const roomId = data['id']
		const keyStatus: KeyStatus = data['key']
		const roomIndex = this.searchRoom(roomId)
		if (roomIndex == -1) return
		this.gameRooms[roomIndex].barSelect(keyStatus, client)
	}

	checkInMatchUsers(userId: string): number {
		for (let i = 0; i < this.matchUsers.length; i++) {
			if (userId == this.matchUsers[i].userId) {
				return i
			}
		}
		return -1
	}

	checkAndUpdateInMatchUsers(userId: string, client: Socket): boolean {
		const index = this.checkInMatchUsers(userId)
		if (index == -1) return false
		this.matchUsers[index].client = client
		return true
	}

	disconnectMatchUserRemove() {
		const removeArray = []
		for (let i = 0; i < this.matchUsers.length; i++) {
			if (!this.matchUsers[i].client.connected) {
				removeArray.push(i)
			}
		}
		for (let i = removeArray.length - 1; i >= 0; i--) {
			this.matchUsers.splice(removeArray[i], 1)
		}
	}

	disconnectAllRooms(userId: string) {
		for (let i = 0; i < this.gameRooms.length; i++) {
			this.gameRooms[i].disconnectUser(userId)
		}
	}

	@SubscribeMessage('readyGameIndex')
	handleReadyGameIndex(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		const userId: string = data['userId']
		this.disconnectAllRooms(userId)
		let status = 0
		const gameId = this.searchRoomFromUserId(userId)
		if (gameId) {
			status = 2
		}
		this.disconnectMatchUserRemove()
		if (!gameId && this.checkInMatchUsers(userId) != -1) {
			status = 1
		}
		this.server.to(client.id).emit('setFirstGameRooms', {
			gameRooms: this.gameRoomInfos,
			status: status,
			gameRoomId: gameId,
		})
		client.join('readyIndex')
	}

	// @UseGuards(AuthGuard('jwt'), UserAuth)
	@SubscribeMessage('registerMatch')
	async handleRegisterMatch(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		const userId = data['userId']
		// this.logger.log(client.handshake.headers['cookie']);
		// this.logger.log(client.handshake.headers);
		const user = this.currentUser(userId)
		user.then((user) => {
			const userName = user['username']
			this.logger.log(userId)
			this.logger.log(userName)
			this.disconnectMatchUserRemove()
			if (!this.checkAndUpdateInMatchUsers(userId, client)) {
				const clientData: socketData = {
					client: client,
					role: -1,
					userId: userId,
					userName: userName,
				}
				if (this.matchUsers.length >= 1) {
					this.matchUsers[0].role = 0
					clientData.role = 1
					const roomId = this.makeGameRoom(
						this.matchUsers[0],
						clientData,
					)
					this.server.to(client.id).emit('goGameRoom', roomId)
					this.server
						.to(this.matchUsers[0].client.id)
						.emit('goGameRoom', roomId)
					this.matchUsers.splice(0, 1)
				} else {
					this.matchUsers.push(clientData)
				}
			}
			this.logger.log(this.matchUsers.length)
		})
	}

	@SubscribeMessage('cancelMatch')
	handleCancelMatch(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	) {
		for (let i = 0; i < this.matchUsers.length; i++) {
			if (client.id == this.matchUsers[i].client.id) {
				this.matchUsers.splice(i, 1)
				break
			}
		}
		this.logger.log(this.matchUsers.length)
	}
}
