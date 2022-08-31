import { InternalServerErrorException } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { GameRepository } from './game.repository'
import { UsersRepository } from 'src/user/user.repository'
import { GameHistory } from './entities/gameHistory.entity'
import { gameInfo } from './game.interface'

@Injectable()
export class GameService {
	constructor() {}

	async saveGameHistory(info: gameInfo) {
		let gameHistory = await GameRepository.createGameHistory(info)

		if (!info.userOne.game_history) info.userOne.game_history = []
		if (!info.userTwo.game_history) info.userTwo.game_history = []
		info.userOne.game_history.push(gameHistory)
		info.userTwo.game_history.push(gameHistory)

		try {
			await UsersRepository.save(info.userOne)
			await UsersRepository.save(info.userTwo)
		} catch (e) {
			throw new InternalServerErrorException()
		}
	}
}
