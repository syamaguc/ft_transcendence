export interface Position {
  top: number
  left: number
}

interface Player {
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

export interface GamePlayer {
  id: string
  name: string
}

export interface GameRoom {
  id: string
  player1: GamePlayer
  player2: GamePlayer
}
