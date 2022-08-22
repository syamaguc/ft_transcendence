import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from './game.lib'
import { socketData, KeyStatus } from "./game.interface";


@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway {
  @WebSocketServer()
  private server: Server;
  private gameRooms: GameRoom[] = [];
  private matchUsers: socketData[] = [];
  private logger: Logger = new Logger('Gateway Log');


  searchRoom(roomId: string) {
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        return i;
      }
    }
    return -1;
  }


  @SubscribeMessage('connectServer')
  handleConnect(@MessageBody() data: string, @ConnectedSocket() client: Socket): WsResponse<number> {
    // debug
    if (this.gameRooms.length == 0) {
      this.gameRooms.push(new GameRoom('a', this.server));
      this.gameRooms.push(new GameRoom('b', this.server));
      this.gameRooms.push(new GameRoom('c', this.server));
    }

    for (let i = 0; i < this.gameRooms.length; i++) {
      if (data == this.gameRooms[i].id) {
        const role: number = this.gameRooms[i].connect(client);
        return { event: 'connectClient', data: role};
      }
    }
  }


  @SubscribeMessage('start')
  handleStart(@MessageBody() data: any) {
    const roomId = data["id"];
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        this.gameRooms[i].start();
      }
    }
  }


  @SubscribeMessage('retry')
  handleRetry(@MessageBody() data: any) {
    const roomId = data["id"];
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        this.gameRooms[i].retry();
      }
    }
  }


  @SubscribeMessage('move')
  handleMove(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const roomId = data["id"];
    const keyStatus: KeyStatus = data["key"];
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        this.gameRooms[i].barSelect(keyStatus, client);
      }
    }
  }


  disconnectMatchUserRemove() {
    let removeArray = [];
    for (let i = 0; i < this.matchUsers.length; i++) {
      if (!this.matchUsers[i].client.connected) {
        removeArray.push(i);
      }
    }
    for (let i = removeArray.length - 1; i >= 0; i--) {
      this.matchUsers.splice(removeArray[i], 1);
    }
  }


  @SubscribeMessage('registerMatch')
  handleRegisterMatch(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.disconnectMatchUserRemove();
    const clientData: socketData = {client: client, role: -1}
    if (this.matchUsers.length >= 1) {
      const id = uuidv4();
      this.gameRooms.push(new GameRoom(id, this.server));
      this.server.to(client.id).emit("goGameRoom", id);
      this.server.to(this.matchUsers[0].client.id).emit("goGameRoom", id);
      this.matchUsers.splice(0, 1);
    }
    else {
      this.matchUsers.push(clientData);
    }
    this.logger.log(this.matchUsers.length);
  }


  @SubscribeMessage('cancelMatch')
  handleCancelMatch(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    for (let i = 0; i < this.matchUsers.length; i++) {
      if (client.id == this.matchUsers[i].client.id) {
        this.matchUsers.splice(i, 1);
        break;
      }
    }
    this.logger.log(this.matchUsers.length);
  }
}
