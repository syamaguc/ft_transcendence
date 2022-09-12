import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatGateway } from './chat.gateway'
import { ChatService } from './chat.service'
import { ChatRoom } from './entities/chat-room.entity'
import { JwtModule } from '@nestjs/jwt'
import { Message } from './entities/message.entity'
import { UserService } from 'src/user/user.service'

@Module({
	imports: [
		TypeOrmModule.forFeature([ChatRoom, Message]),
		JwtModule.register({
			//secret: process.env.SECRET_JWT,
			secret: 'superSecret2022',
			signOptions: {
				expiresIn: 86400,
			},
		}),
	],

	providers: [ChatGateway, ChatService, UserService],
})
export class ChatModule {}
