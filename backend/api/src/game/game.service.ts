import { InternalServerErrorException } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { GameRepository } from './game.repository'
import { UsersRepository } from 'src/user/user.repository'
import { GameHistory } from './entities/gameHistory.entity'
import { gameInfo } from './game.interface'
import { User } from '../user/entities/user.entity'

@Injectable()
export class GameService {
	//constructor() {}

	async saveGameHistory(info: gameInfo) {
		const gameHistory: GameHistory = await GameRepository.createGameHistory(
			info,
		)

		const userOne: User = await UsersRepository.findOne({
			where: { userId: info.player1 },
		})
		const userTwo = await UsersRepository.findOne({
			where: { userId: info.player2 },
		})

		if (!userOne.game_history) userOne.game_history = []
		if (!userTwo.game_history) userTwo.game_history = []
		userOne.game_history.push(gameHistory)
		userTwo.game_history.push(gameHistory)

		try {
			await UsersRepository.save(userOne)
			await UsersRepository.save(userTwo)
		} catch (e) {
			throw new InternalServerErrorException()
		}
	}
}
