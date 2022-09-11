import { Socket } from 'socket.io'

export interface gameInfo {
	gameId: string
	player1: string
	player2: string
	player1Score: number
	player2Score: number
}

export interface Position {
	top: number
	left: number
}

export interface Player {
	point: number
	name: string
}

export interface GameSetting {
	point: number
	speed: number
}

export interface GameObject {
	bar1: Position
	bar2: Position
	ball: Position
	player1: Player
	player2: Player
	gameStatus: number
	gameSetting: GameSetting
}

export interface socketData {
	role: number
	client: Socket
	userId: string
	userName: string
}

export interface KeyStatus {
	upPressed: boolean
	downPressed: boolean
}

export interface GamePlayer {
	id: string
	name: string
}

export interface GameRoomInfo {
	id: string
	player1: GamePlayer
	player2: GamePlayer
}
