export interface Position {
  top: number
  left: number
}

interface Player {
  num: number
  point: number
}

export interface GameObject {
  bar1: Position
  bar2: Position
  ball: Position
  player1: Player
  player2: Player
  gameStatus: number
  // gameSetting: GameSetting;
}
