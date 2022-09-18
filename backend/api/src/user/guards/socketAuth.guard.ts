import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { UserService } from '../user.service'
import { User } from '../entities/user.entity'
import jwt_decode from 'jwt-decode'
import { UsersRepository } from '../user.repository'

@Injectable()
export class SocketGuard implements CanActivate {
	private logger: Logger = new Logger(SocketGuard.name)

	constructor(private userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const client: Socket = context.switchToWs().getClient<Socket>()
			const authToken: string = client.handshake.headers['cookie']
			const decode = jwt_decode(authToken)
			const user: User = await UsersRepository.findOne({
				where: { userId: decode['userid'] },
			})
      if (user)
			  return true
      else
        return false
		} catch (err) {
			throw new WsException(err.message)
		}
	}
}
