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

export interface GameObject {
  bar1: Position
  bar2: Position
  ball: Position
  player1: Player
  player2: Player
  gameStatus: number
  gameSetting: GameSetting
}
