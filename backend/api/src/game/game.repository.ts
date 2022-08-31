import { InternalServerErrorException } from '@nestjs/common'
import { GameHistory } from './entities/gameHistory.entity'
import { AppDataSource } from '../app/app.datasource'
import { gameInfo } from './game.interface'

export const GameRepository = AppDataSource.getRepository(GameHistory).extend({
	async createGameHistory(game: gameInfo) {
		const gameHistory: GameHistory = this.create()

		//ここでgameHistoryにgameInfoの値を入れる

		try {
			await this.save(gameHistory)
			return gameHistory
		} catch (e) {
			throw new InternalServerErrorException()
		}
	},
})
