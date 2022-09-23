import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import {
	Position,
	GameObject,
	SocketData,
	KeyStatus,
	gameInfo,
	GameStatus,
	UserDict,
} from './game.interface'
import { GameService } from './game.service'

const heightBaseSize = 1000
const widthBaseSize = 2000
const barBaseHeight = 200
const barBaseWidth = 50
const ballBaseSize = 50
const ballSpeed = 20
const barSpeed = 20
const settingTime = 30

class BallDirection {
	ballRadian: number
	moveX: number
	moveY: number
}

export interface GameRoomDict {
	[id: string]: GameRoom
}

export class GameRoom {
	id: string
	server: Server
	gameObject: GameObject
	interval
	ballDirection: BallDirection
	socketDatas: UserDict
	logger: Logger
	player1Id: string
	player2Id: string

	gameObjectInit(
		point: number,
		speed: number,
		player1Name: string,
		player2Name: string,
	) {
		this.gameObject = {
			bar1: {
				top: (heightBaseSize - barBaseHeight) / 2,
				left: ballBaseSize,
			},
			bar2: {
				top: (heightBaseSize - barBaseHeight) / 2,
				left: widthBaseSize - ballBaseSize * 2,
			},
			ball: {
				top: (heightBaseSize - ballBaseSize) / 2,
				left: (widthBaseSize - ballBaseSize) / 2,
			},
			player1: { point: 0, name: player1Name },
			player2: { point: 0, name: player2Name },
			gameStatus: 0,
			remainSeconds: 0,
			gameSetting: { point: point, speed: speed },
			retryFlag: { player1: false, player2: false },
		}
	}

	constructor(
		id: string,
		server: Server,
		player1: SocketData,
		player2: SocketData,
	) {
		this.id = id
		this.server = server
		this.gameObjectInit(2, 1, player1.userName, player2.userName)
		this.ballDirection = {
			ballRadian: 0,
			moveX: 0,
			moveY: 0,
		}
		this.socketDatas = {}
		this.socketDatas[player1.userId] = player1
		this.socketDatas[player2.userId] = player2
		this.player1Id = player1.userId
		this.player2Id = player2.userId
		this.logger = new Logger('GameRoom Log')
	}

	gameSave() {
		const info: gameInfo = {
			gameId: this.id,
			player1Score: this.gameObject.player1.point,
			player2Score: this.gameObject.player2.point,
			player1: this.player1Id,
			player2: this.player2Id,
		}
		new GameService().saveGameHistory(info)
	}

	settingStart(gameGateWay) {
		this.gameObject.remainSeconds = settingTime
		this.interval = setInterval(() => {
			this.gameObject.remainSeconds -= 1
			if (this.gameObject.remainSeconds == 0) {
				clearInterval(this.interval)
				gameGateWay.settingEnd(this.id)
			} else {
				this.updateObject()
			}
		}, 1000)
	}

	settingEnd() {
		clearInterval(this.interval)
	}

	setBallBounce(barTop: number) {
		const directionX = this.ballDirection.moveX > 0 ? -1 : 1
		const top = barTop - ballBaseSize
		const bottom = barTop + barBaseHeight
		const whole = bottom - top
		const conflictPosition = bottom - this.gameObject.ball.top
		let directionY = 0
		let radianRatio = 0
		if (conflictPosition / whole > 0.5) {
			directionY = -1
			if (this.gameObject.ball.top == heightBaseSize - ballBaseSize) {
				directionY = 1
			}
			radianRatio = (conflictPosition / whole - 0.5) * 2
		} else {
			directionY = 1
			if (this.gameObject.ball.top == 0) {
				directionY = -1
			}
			radianRatio = 1 - (conflictPosition / whole) * 2
		}
		this.ballDirection.ballRadian = (radianRatio * Math.PI) / 4
		this.ballDirection.moveX =
			directionX *
			Math.cos(this.ballDirection.ballRadian) *
			ballSpeed *
			this.gameObject.gameSetting.speed
		this.ballDirection.moveY =
			directionY *
			Math.sin(this.ballDirection.ballRadian) *
			ballSpeed *
			this.gameObject.gameSetting.speed
	}

	ballMove() {
		const ballRightMax = widthBaseSize - ballBaseSize
		const ballBottomMax = heightBaseSize - ballBaseSize

		// Moving the ball
		this.gameObject.ball.left = Math.min(
			ballRightMax,
			Math.max(0, this.gameObject.ball.left + this.ballDirection.moveX),
		)
		this.gameObject.ball.top = Math.min(
			ballBottomMax,
			Math.max(0, this.gameObject.ball.top + this.ballDirection.moveY),
		)

		// Reflection from hitting the wall above
		if (this.gameObject.ball.top == 0) {
			this.ballDirection.moveY *= -1
		}
		// Reflection from hitting the wall below
		if (this.gameObject.ball.top == ballBottomMax) {
			this.ballDirection.moveY *= -1
		}
		// Reflection from hitting the bar on the left
		if (
			this.gameObject.bar1.top <=
				this.gameObject.ball.top + ballBaseSize &&
			this.gameObject.ball.top <=
				this.gameObject.bar1.top + barBaseHeight &&
			this.gameObject.bar1.left <= this.gameObject.ball.left &&
			this.gameObject.ball.left <=
				this.gameObject.bar1.left + barBaseWidth &&
			this.ballDirection.moveX < 0
		) {
			this.setBallBounce(this.gameObject.bar1.top)
		}
		// Reflection from hitting the bar on the right
		if (
			this.gameObject.bar2.top <=
				this.gameObject.ball.top + ballBaseSize &&
			this.gameObject.ball.top <=
				this.gameObject.bar2.top + barBaseHeight &&
			this.gameObject.bar2.left <=
				this.gameObject.ball.left + ballBaseSize &&
			this.gameObject.ball.left + ballBaseSize <=
				this.gameObject.bar2.left + barBaseWidth &&
			this.ballDirection.moveX > 0
		) {
			this.setBallBounce(this.gameObject.bar2.top)
		}
	}

	ballReset() {
		this.gameObject.ball.top = (heightBaseSize - ballBaseSize) / 2
		this.gameObject.ball.left = (widthBaseSize - ballBaseSize) / 2
		this.ballDirection.ballRadian = (Math.random() * Math.PI) / 4
		this.ballDirection.moveX =
			(Math.random() < 0.5 ? 1 : -1) *
			Math.cos(this.ballDirection.ballRadian) *
			ballSpeed *
			this.gameObject.gameSetting.speed
		this.ballDirection.moveY =
			(Math.random() < 0.5 ? 1 : -1) *
			Math.sin(this.ballDirection.ballRadian) *
			ballSpeed *
			this.gameObject.gameSetting.speed
	}

	turnFinish() {
		let finishFlag = 0
		// Add Points
		if (this.gameObject.ball.left == 0) {
			this.gameObject.player2.point += 1
			if (
				this.gameObject.player2.point ==
				this.gameObject.gameSetting.point
			) {
				finishFlag = 2
			}
		} else {
			this.gameObject.player1.point += 1
			if (
				this.gameObject.player1.point ==
				this.gameObject.gameSetting.point
			) {
				finishFlag = 1
			}
		}

		// Game Reset
		clearInterval(this.interval)
		if (finishFlag == 0) {
			this.play()
		} else {
			this.gameSave()
			this.gameObject.gameStatus = 2
			this.updateObject()
		}
	}

	play() {
		this.gameObject.gameStatus = 1
		this.ballReset()
		this.interval = setInterval(() => {
			this.ballMove()
			if (
				this.gameObject.ball.left == 0 ||
				this.gameObject.ball.left == widthBaseSize - ballBaseSize
			) {
				this.turnFinish()
			} else {
				this.server.to(this.id).emit('clientMove', this.gameObject)
			}
		}, 30)
	}

	addWatcher(socketData: SocketData) {
		socketData.client.join(this.id)
		socketData.gameId = this.id
		socketData.role = 2
		socketData.status = GameStatus.Watch
		this.socketDatas[socketData.userId] = socketData
	}

	disconnectAll() {
		for (const key in this.socketDatas) {
			if (this.socketDatas[key].client.connected) {
				this.socketDatas[key].client.leave(this.id)
			}
		}
	}

	removeNotPlayer(userId: string) {
		if (!(userId in this.socketDatas)) return
		const socketData = this.socketDatas[userId]
		if (socketData.client.connected) {
			socketData.client.leave(this.id)
		}
		socketData.gameId = ''
		delete this.socketDatas[userId]
	}

	removeDisconnectNotPlayer() {
		const removeArray = []
		for (const userId in this.socketDatas) {
			if (!this.socketDatas[userId].client.connected) {
				removeArray.push(userId)
			}
		}
		for (let i = 0; i < removeArray.length; i++) {
			delete this.socketDatas[removeArray[i]]
		}
		return removeArray
	}

	start(point: number, speed: number) {
		this.settingEnd()
		this.gameObjectInit(
			point,
			speed,
			this.gameObject.player1.name,
			this.gameObject.player2.name,
		)
		this.play()
	}

	retry(userId: string): [GameObject, SocketData, SocketData] {
		const player1: SocketData = this.socketDatas[this.player1Id]
		const player2: SocketData = this.socketDatas[this.player2Id]
		if (this.player1Id == userId) {
			this.gameObject.retryFlag.player1 = true
		} else if (this.player2Id == userId) {
			this.gameObject.retryFlag.player2 = true
		}
		this.updateObject()
		return [this.gameObject, player1, player2]
	}

	retryCancel(userId: string) {
		if (this.player1Id == userId) {
			this.gameObject.retryFlag.player1 = false
		} else if (this.player2Id == userId) {
			this.gameObject.retryFlag.player2 = false
		}
		this.updateObject()
	}

	quit() {
		this.server.to(this.id).emit('clientQuit')
	}

	updateObject() {
		this.server.to(this.id).emit('updateGameObject', this.gameObject)
	}

	makeGameRoomInfo() {
		return {
			id: this.id,
			player1: {
				id: this.player1Id,
				name: this.socketDatas[this.player1Id].userName,
			},
			player2: {
				id: this.player2Id,
				name: this.socketDatas[this.player2Id].userName,
			},
		}
	}

	emitGameRoomInfo() {
		const gameRoomInfo = this.makeGameRoomInfo()
		this.server
			.to('readyIndex')
			.emit('addGameRoom', { gameRoom: gameRoomInfo })
	}

	settingChange(name: string, checked: boolean, value: number) {
		if (name == 'point') {
			if (checked) {
				this.gameObject.gameSetting.point = value
			}
		} else if (name == 'speed') {
			if (checked) {
				this.gameObject.gameSetting.speed = value
			}
		}
		this.updateObject()
	}

	barMove(keyStatus: KeyStatus, position: Position) {
		if (keyStatus.upPressed) {
			if (position.top >= barSpeed) position.top = position.top - barSpeed
		}
		if (keyStatus.downPressed) {
			if (position.top <= heightBaseSize - barBaseHeight - barSpeed)
				position.top = position.top + barSpeed
		}
	}

	barSelect(keyStatus: KeyStatus, client: Socket) {
		if (!(client.data.userId in this.socketDatas)) return
		if (this.socketDatas[client.data.userId].role == 0) {
			this.barMove(keyStatus, this.gameObject.bar1)
		} else if (this.socketDatas[client.data.userId].role == 1) {
			this.barMove(keyStatus, this.gameObject.bar2)
		}
	}
}
