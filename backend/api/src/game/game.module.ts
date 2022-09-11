import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from 'src/user/user.module'
import { GameHistory } from './entities/gameHistory.entity'
import { GameController } from './game.controller'
import { GameService } from './game.service'
import { GameGateway } from './game.gateway'

@Module({
	imports: [TypeOrmModule.forFeature([GameHistory]), UserModule],
	providers: [GameGateway, GameService],
	controllers: [GameController],
	exports: [GameService],
})
export class GameModule {}
