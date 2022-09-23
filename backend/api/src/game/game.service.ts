import { InternalServerErrorException } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'
import { parse } from 'cookie'
import { JwtService } from '@nestjs/jwt'
import { GameRepository } from './game.repository'
import { UsersRepository } from 'src/user/user.repository'
import { JwtPayload } from 'src/user/interfaces/jwt-payload.interface'
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

		if (info.player1Score > info.player2Score) {
			userOne.game_won += 1
			userTwo.lost_game += 1
			userOne.elo += 10
			userTwo.elo -= 10
		} else {
			userTwo.game_won += 1
			userOne.lost_game += 1
			userTwo.elo += 10
			userOne.elo -= 10
		}

		try {
			await UsersRepository.save(userOne)
			await UsersRepository.save(userTwo)
		} catch (e) {
			throw new InternalServerErrorException()
		}
	}

	setUserToSocket(socket: Socket) {
		const cookie = socket.handshake.headers['cookie']
		const { jwt: token } = parse(cookie)
		if (!token) {
			console.log('no JWT provided')
			socket.disconnect()
			return
		}
		const payload: JwtPayload = new JwtService().verify(token, {
			//secret: process.env.SECRET_JWT,
			secret: 'superSecret2022',
		})
		const { userid, username } = payload
		socket.data.userId = userid
		socket.data.username = username
	}
}
