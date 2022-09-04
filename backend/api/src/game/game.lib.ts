import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import {
	Position,
	GameObject,
	socketData,
	KeyStatus,
	gameInfo,
} from './game.interface'
import { GameService } from './game.service'

const heightBaseSize = 1000
const widthBaseSize = 2000
const barBaseHeight = 200
const barBaseWidth = 50
const ballBaseSize = 50
const ballSpeed = 20
const barSpeed = 20

class BallDirection {
	ballRadian: number
	moveX: number
	moveY: number
}

export class GameRoom {
	id: string
	server: Server
	gameObject: GameObject
	interval
	ballDirection: BallDirection
	socketDatas: socketData[]
	logger: Logger

	_get_player1_and_player2() {
		let player1
		let player2
		for (let i = 0; i < this.socketDatas.length; i++) {
			if (this.socketDatas[i].role == 0) {
				player1 = this.socketDatas[i]
			} else if (this.socketDatas[i].role == 1) {
				player2 = this.socketDatas[i]
			}
			if (player1 && player2) {
				break
			}
		}
		return [player1, player2]
	}

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
			gameSetting: { point: point, speed: speed },
		}
	}

	constructor(
		id: string,
		server: Server,
		player1: socketData,
		player2: socketData,
	) {
		this.id = id
		this.server = server
		this.gameObjectInit(2, 1, player1.userName, player2.userName)
		this.ballDirection = {
			ballRadian: 0,
			moveX: 0,
			moveY: 0,
		}
		this.socketDatas = [player1, player2]
		this.logger = new Logger('GameRoom Log')
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
			let player1
			let player2
			;[player1, player2] = this._get_player1_and_player2()

			console.log(player1.userId)
			console.log(player2.userId)

			const info: gameInfo = {
				gameId: this.id,
				player1Score: this.gameObject.player1.point,
				player2Score: this.gameObject.player2.point,
				player1: player1.userId,
				player2: player2.userId,
			}
			new GameService().saveGameHistory(info)

			this.gameObject.gameStatus = 2
			this.server.to(this.id).emit('updateGameObject', this.gameObject)
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

	connect(client: Socket, userId: string) {
		client.join(this.id)
		// roleの判定は変更予定
		let role = 2
		let joinedFlag = false
		for (let i = 0; i < this.socketDatas.length; i++) {
			if (this.socketDatas[i].userId == userId) {
				role = this.socketDatas[i].role
				this.socketDatas[i].client = client
				joinedFlag = true
				break
			}
		}
		if (!joinedFlag) {
			this.socketDatas.push({
				client: client,
				role: 2,
				userId: userId,
				userName: '',
			})
		}
		this.logger.log(client.id)
		this.logger.log('client num:', this.socketDatas.length)
		return role
	}

	start(point: number, speed: number) {
		this.gameObjectInit(
			point,
			speed,
			this.gameObject.player1.name,
			this.gameObject.player2.name,
		)
		this.play()
	}

	retry() {
		let player1
		let player2
		;[player1, player2] = this._get_player1_and_player2()
		return [this.gameObject, player1, player2]
	}

	quit() {
		this.server.to(this.id).emit('clientQuit')
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
		this.server.to(this.id).emit('updateGameObject', this.gameObject)
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
		for (let i = 0; i < this.socketDatas.length; i++) {
			if (client.id == this.socketDatas[i].client.id) {
				if (this.socketDatas[i].role == 0) {
					this.barMove(keyStatus, this.gameObject.bar1)
					break
				} else if (this.socketDatas[i].role == 1) {
					this.barMove(keyStatus, this.gameObject.bar2)
					break
				}
			}
		}
	}
}
