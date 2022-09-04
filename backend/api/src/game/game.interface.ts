import { Socket } from 'socket.io';
import { User } from '../user/entities/user.entity'

export class gameInfo {
  userOne: User
  userTwo: User

  //scoreとかgameidとかここでぜんぶ持つイメージ?
}

export interface Position {
  top: number;
  left: number;
}

export interface Player {
  point: number
  name: string
}

export interface GameSetting{
  point: number;
  speed: number;
}

export interface GameObject {
  bar1: Position;
  bar2: Position;
  ball: Position;
  player1: Player;
  player2: Player;
  gameStatus: number;
  gameSetting: GameSetting;
}

export interface socketData {
  role: number
  client: Socket
  userId: string
  userName: string
}

export interface KeyStatus {
  upPressed: boolean;
  downPressed: boolean;
}
