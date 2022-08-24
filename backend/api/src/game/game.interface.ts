import { Socket } from 'socket.io';

export interface Position {
  top: number;
  left: number;
}

export interface Player {
  role: number;
  point: number;
}

export interface GameObject {
  bar1: Position;
  bar2: Position;
  ball: Position;
  player1: Player;
  player2: Player;
  gameStatus: number;
}

export interface socketData {
  role: number;
  client: Socket;
}

export interface KeyStatus {
  upPressed: boolean;
  downPressed: boolean;
}
