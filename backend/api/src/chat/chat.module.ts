import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatGateway } from './chat.gateway'
import { ChatService } from './chat.service'
import { ChatRoom } from './entities/chat-room.entity'
import { JwtModule } from '@nestjs/jwt'
import { Message } from './entities/message.entity'
import { UserService } from 'src/user/user.service'
import { DMRoom } from './entities/dm-room.entity'
import { DMGateway } from './dm.gateway'
import { DMService } from './dm.service'

@Module({
	imports: [
		TypeOrmModule.forFeature([ChatRoom, DMRoom, Message]),
		JwtModule.register({
			//secret: process.env.SECRET_JWT,
			secret: 'superSecret2022',
			signOptions: {
				expiresIn: 86400,
			},
		}),
	],

	providers: [ChatGateway, ChatService, DMGateway, DMService, UserService],
})
export class ChatModule {}
