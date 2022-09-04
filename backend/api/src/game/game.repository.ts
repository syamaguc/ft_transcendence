import { InternalServerErrorException } from '@nestjs/common'
import { GameHistory } from './entities/gameHistory.entity'
import { AppDataSource } from '../app/app.datasource'
import { gameInfo } from './game.interface'

export const GameRepository = AppDataSource.getRepository(GameHistory).extend({
	async createGameHistory(info: gameInfo) {
		const gameHistory: GameHistory = this.create()

		gameHistory.gameId = info.gameId
		gameHistory.playerOne = info.player1
		gameHistory.playerTwo = info.player2
		gameHistory.playerOneScore = info.player1Score
		gameHistory.playerTwoScore = info.player2Score
		if (info.player1Score > info.player2Score) {
			gameHistory.playerWin = info.player1
			gameHistory.playerLoose = info.player2
		} else {
			gameHistory.playerWin = info.player2
			gameHistory.playerLoose = info.player1
		}

		try {
			await this.save(gameHistory)
			return gameHistory
		} catch (e) {
			throw new InternalServerErrorException()
		}
	},
})
