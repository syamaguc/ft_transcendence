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

export interface RetryFlag {
	player1: boolean
	player2: boolean
}

export interface GameObject {
	bar1: Position
	bar2: Position
	ball: Position
	player1: Player
	player2: Player
	gameStatus: number
	remainSeconds: number
	gameSetting: GameSetting
	retryFlag: RetryFlag
}

export interface SocketData {
	role: number
	client: Socket
	userId: string
	userName: string
	status: GameStatus
	gameId: string
}

export interface KeyStatus {
	upPressed: boolean
	downPressed: boolean
}

export interface GamePlayer {
	id: string
	name: string
}

export enum GameStatus {
	MatchReady,
	Matching,
	InviteReady,
	Invite,
	Invited,
	Game,
	Watch,
}

export interface UserDict {
	[id: string]: SocketData
}

export interface InviteDict {
	[id: string]: SocketData[]
}
