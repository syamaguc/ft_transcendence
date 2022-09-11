import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GameService } from './game.service'

@ApiTags('game')
@Controller('api/game')
export class GameController {
	constructor(private gameService: GameService) {}
}
