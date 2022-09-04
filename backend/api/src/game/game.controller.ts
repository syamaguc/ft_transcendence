import {
	Controller,
	Get,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
	ApiOperation,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger'
import { GameService } from './game.service'
import { GameGateway } from './game.gateway'

@ApiTags('game')
@Controller('api/game')
export class GameController {
	constructor(private gameService: GameService) {}

}
