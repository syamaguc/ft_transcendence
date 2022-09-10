import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatGateway } from './chat.gateway'
import { ChatService } from './chat.service'
import { ChatRoom } from './entities/chat-room.entity'
import { Message } from './entities/message.entity'

@Module({
	imports: [TypeOrmModule.forFeature([ChatRoom, Message])],

	providers: [ChatGateway, ChatService],
})
export class ChatModule {}
