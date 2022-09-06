import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WsResponse,
} from '@nestjs/websockets';
import { Logger, UseGuards, NotFoundException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { UserAuth } from '../user/guards/userAuth.guard';
import { User } from '../user/entities/user.entity';
import { UsersRepository } from '../user/user.repository';
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

  async currentUser(userId: string): Promise<Partial<User>> {
		let userFound: User = undefined;
		userFound = await UsersRepository.findOne({
			where: { userId: userId },
		});
		if (!userFound) throw new NotFoundException('No user found');
		const { password, ...res } = userFound;
		return res;
	}

  @SubscribeMessage('connectServer')
  handleConnect(@MessageBody() data, @ConnectedSocket() client: Socket) {
    // debug
    // if (this.gameRooms.length == 0) {
    //   this.gameRooms.push(new GameRoom('a', this.server));
    //   this.gameRooms.push(new GameRoom('b', this.server));
    //   this.gameRooms.push(new GameRoom('c', this.server));
    // }

    const roomId = data['roomId']
    const userId = data['userId']
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        const role: number = this.gameRooms[i].connect(client, userId);
        this.server.to(client.id).emit('connectClient', {role: role, gameObject: this.gameRooms[i].gameObject})
        return
      }
    }
    this.server.to(client.id).emit('noRoom')
  }


  @SubscribeMessage('settingChange')
  handleSettingChange(@MessageBody() data: any) {
    const roomId = data["id"];
    const name = data["name"];
    const checked = data["checked"];
    const value = data["value"];
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        this.gameRooms[i].settingChange(name, checked, value);
      }
    }
  }


  @SubscribeMessage('start')
  handleStart(@MessageBody() data: any) {
    const roomId = data["id"];
    const point = data["point"];
    const speed = data["speed"];
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        this.gameRooms[i].start(point, speed);
      }
    }
  }


  @SubscribeMessage('retry')
  handleRetry(@MessageBody() data: any) {
    const roomId = data["id"];
    let gameObject
    let player1
    let player2
    let socketDatas
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        [gameObject, player1, player2] = this.gameRooms[i].retry();
        socketDatas = this.gameRooms[i].socketDatas
        this.gameRooms.splice(i, 1);
        break
      }
    }
    const id = uuidv4();
    let gameRoom = new GameRoom(id, this.server, player1, player2);
    gameRoom.gameObject.gameSetting = gameObject.gameSetting
    this.gameRooms.push(gameRoom);
    for (let i = 0; i < socketDatas.length; i++) {
      this.server.to(socketDatas[i].client.id).emit("goNewGame", id);
    }
  }


  @SubscribeMessage('quit')
  handleQuit(@MessageBody() data: any) {
    const roomId = data["id"];
    for (let i = 0; i < this.gameRooms.length; i++) {
      if (roomId == this.gameRooms[i].id) {
        this.gameRooms[i].quit();
        this.gameRooms.splice(i, 1);
        break
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


  // @UseGuards(AuthGuard('jwt'), UserAuth)
  @SubscribeMessage('registerMatch')
  async handleRegisterMatch(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const userId = data['userId'];
    // this.logger.log(client.handshake.headers['cookie']);
    // this.logger.log(client.handshake);
    const user = this.currentUser(userId);
    user.then((user) => {
      const userName = user['username']
      this.logger.log(userId);
      this.logger.log(userName);
      this.disconnectMatchUserRemove();
      const clientData: socketData = {client: client, role: -1, userId: userId, userName: userName}
      if (this.matchUsers.length >= 1) {
        const id = uuidv4();
        this.matchUsers[0].role = 0
        clientData.role = 1
        this.gameRooms.push(new GameRoom(id, this.server, this.matchUsers[0], clientData));
        this.server.to(client.id).emit("goGameRoom", id);
        this.server.to(this.matchUsers[0].client.id).emit("goGameRoom", id);
        this.matchUsers.splice(0, 1);
      }
      else {
        this.matchUsers.push(clientData);
      }
      this.logger.log(this.matchUsers.length);
    });
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
