import {
	Injectable,
	UnauthorizedException,
	NotFoundException,
	UploadedFile,
	Res,
	InternalServerErrorException,
	//Req,
	//ConsoleLogger,
	//ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
// import { Repository } from 'typeorm';
import { User } from './entities/user.entity'
import { CreateUserDto, SigInUserDto } from './dto/user.dto'
import * as bcrypt from 'bcrypt'
import { UsersRepository } from './user.repository'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { GetUserFilterDto } from './dto/get-user-filter.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { Observable, of } from 'rxjs'
import { join } from 'path'
import { User42Dto } from './dto/user42.dto'
import { Response, Request } from 'express'
import { UserStatus } from './interfaces/user-status.enum'
// import { UserModule } from './user.module';

@Injectable()
export class UserService {
	constructor(
		//@InjectRepository(UsersRepository)
		//private usersRepository: UsersRepository,
		private jwtService: JwtService,
	) {}

	async signUp(
		userData: CreateUserDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<{ accessToken: string }> {
		const { username, password } = userData
		const user: Promise<User> = UsersRepository.createUser(userData)
		if (await bcrypt.compare(password, (await user).password)) {
			const auth = false
			const userid = (await user).userId
			const payload: JwtPayload = { username, auth, userid }
			const accessToken: string = await this.jwtService.sign(payload)
			res.cookie('jwt', accessToken, { httpOnly: true })
			return { accessToken }
		} else {
			throw new InternalServerErrorException(
				'access token creation error',
			)
		}
	}

	async validateUser42(userData: User42Dto): Promise<User> {
		let user: User = undefined

		const { login42 } = userData
		user = await UsersRepository.findOne({
			where: { login42: login42 },
		})
		if (user) {
			user.login_count += 1
			UsersRepository.save(user)
			return user
		}
		let { username } = userData
		user = await UsersRepository.findOne({
			where: { username: username },
		})
		if (user) {
			const rand = Math.random().toString(16).substr(2, 5)
			username = username + '-' + rand
			userData.username = username
		}
		const newUser: User = await this.createUser42(userData)
		return newUser
	}

	createUser42(userData: User42Dto): Promise<User> {
		return UsersRepository.createUser42(userData)
	}

	async signIn(
		userData: SigInUserDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<{ accessToken: string }> {
		const { username, password } = userData
		let user: User = undefined

		user = await UsersRepository.findOne({ where: { username: username } })
		if (user === undefined) {
			user = await UsersRepository.findOne({
				where: { email: username },
			})
		}
		if (user && (await bcrypt.compare(password, user.password))) {
			user.status = UserStatus.ONLINE
			user.login_count += 1
			try {
				await UsersRepository.save(user)
			} catch (e) {
				console.log(e)
				throw new InternalServerErrorException()
			}
			const username = user.username
			const auth = false
			const userid = user.userId
			const payload: JwtPayload = { username, auth, userid }
			const accessToken: string = await this.jwtService.sign(payload)
			res.cookie('jwt', accessToken, { httpOnly: true })
			return { accessToken }
		} else {
			throw new UnauthorizedException(
				'Please check your login credentials',
			)
		}
	}

	async logout(user: User) {
		let userFound: User = undefined
		userFound = await UsersRepository.findOne({
			where: { userId: user.userId },
		})
		userFound.status = UserStatus.OFFLINE
		try {
			await UsersRepository.save(userFound)
		} catch (e) {
			console.log(e)
			throw new InternalServerErrorException()
		}
	}

	async currentUser(user: User): Promise<Partial<User>> {
		let userFound: User = undefined
		userFound = await UsersRepository.findOne({
			where: { userId: user.userId },
		})
		if (!userFound) throw new NotFoundException('No user found')
		const { password, ...res } = user
		return res
	}

	async userInfo(username: string): Promise<Partial<User>> {
		let user: User = undefined
		user = await UsersRepository.findOne({
			where: { username: username },
		})
		if (!user) throw new NotFoundException('No user found')
		const { password, ...res } = user
		return res
	}

	async getPartialUserInfo(id: string): Promise<Partial<User>> {
		let user: User = undefined

		user = await UsersRepository.findOne({ where: { userId: id } })
		if (!user) return user
		return {
			userId: user.userId,
			username: user.username,
			elo: user.elo,
			profile_picture: user.profile_picture,
			status: user.status,
		}
	}

	getUserWithFilters(filterDto: GetUserFilterDto): Promise<Partial<User[]>> {
		return UsersRepository.getUsersWithFilters(filterDto)
	}

	async updateUser(
		updateUser: UpdateUserDto,
		user: User,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		const { username } = updateUser

		const updated: boolean = await UsersRepository.updateUser(
			updateUser,
			user,
		)
		if (updated === true && username !== undefined) {
			const auth = true
			const userid = user.userId
			const payload: JwtPayload = { username, auth, userid }
			const accessToken: string = await this.jwtService.sign(payload)
			res.cookie('jwt', accessToken, { httpOnly: true })
		}
	}

	async deleteUser(
		id: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		const query = await UsersRepository.createQueryBuilder('user').getMany()

		for (const user of query) {
			if (user.friends.indexOf(id) > -1) {
				this.deleteFriend(id, user)
			}
		}
		res.clearCookie('jwt')
		const result = await UsersRepository.delete(id)
	}

	uploadImage(@UploadedFile() file, user: User): Promise<string> {
		return UsersRepository.saveImage(file, user)
	}

	async getProfilePicture(
		@Res() res,
		profilePicture: string,
	): Promise<Observable<object>> {
		const fs = require('fs')
		const files = fs.readdirSync('../upload/image/')
		if (Object.values(files).indexOf(profilePicture) === -1) {
			return of(
				res.sendFile(
					join(process.cwd(), process.env.DEFAULT_PROFILE_PICTURE),
				),
			)
		}
		return of(
			res.sendFile(
				join(process.cwd(), '../upload/image/' + profilePicture),
			),
		)
	}

	blockFriend(friend: string, user: User): Promise<void> {
		return UsersRepository.blockFriend(friend, user)
	}

	unblockFriend(friend: string, user: User): Promise<void> {
		return UsersRepository.unblockFriend(friend, user)
	}

	async getBlockedList(user: User): Promise<object> {
		let i = 0
		const blockedList = []
		while (user.blockedUsers[i]) {
			await this.getPartialUserInfo(user.blockedUsers[i]).then(function (
				result,
			) {
				blockedList.push(result)
				i++
			})
		}
		return blockedList
	}

	addFriend(friend: string, user: User): Promise<void> {
		return UsersRepository.addFriend(friend, user)
	}

	deleteFriend(friend: string, user: User): Promise<void> {
		return UsersRepository.deleteFriend(friend, user)
	}

	async getFriendList(user: User): Promise<object> {
		let i = 0
		const friendList = []
		while (user.friends[i]) {
			await this.getPartialUserInfo(user.friends[i]).then(function (
				result,
			) {
				friendList.push(result)
				i++
			})
		}
		return friendList
	}

	getTwoFactorAuth(user: User): boolean {
		return user.twoFactorAuth
	}

	async updateTwoFactorAuth(
		bool: boolean,
		user: User,
		res: Response,
	): Promise<void> {
		user.twoFactorAuth = bool
		const username = user.username
		try {
			await UsersRepository.save(user)
			const auth = true
			const userid = user.userId
			const payload: JwtPayload = { username, auth, userid }
			const accessToken: string = await this.jwtService.sign(payload)
			res.cookie('jwt', accessToken, { httpOnly: true })
		} catch (e) {
			console.log(e)
			throw new InternalServerErrorException()
		}
	}

	async getIsBan(userId: string, userIsAdmin: User): Promise<boolean> {
		let user: User = undefined

		// if (userIsAdmin.isAdmin === false)
		// 	throw new UnauthorizedException('You aren\'t an administrator');
		user = await UsersRepository.findOne({
			where: { userId: userId },
		})
		if (!user) throw new NotFoundException('No user found')
		return user.isBan
	}

	async updateIsBan(
		bool: boolean,
		userId: string,
		userIsAdmin: User,
	): Promise<void> {
		let user: User = undefined

		if (userIsAdmin.userId === userId) {
			throw new UnauthorizedException(
				'Cannot change your own banned state',
			)
		}

		user = await UsersRepository.findOne({
			where: { userId: userId },
		})
		if (!user) throw new NotFoundException('No user found')

		user.isBan = bool
		try {
			await UsersRepository.save(user)
		} catch (e) {
			console.log(e)
			throw new InternalServerErrorException()
		}
	}

	async getIsAdmin(userId: string, userIsAdmin: User): Promise<boolean> {
		let user: User = undefined

		user = await UsersRepository.findOne({
			where: { userId: userId },
		})
		if (!user) throw new NotFoundException('No user found')
		return user.isAdmin
	}

	async updateIsAdmin(
		bool: boolean,
		userId: string,
		userIsAdmin: User,
	): Promise<void> {
		let user: User = undefined

		if (userIsAdmin.userId === userId) {
			throw new UnauthorizedException(
				'Cannot change your own admin state',
			)
		}

		user = await UsersRepository.findOne({
			where: { userId: userId },
		})
		if (!user) throw new NotFoundException('No user found')

		user.isAdmin = bool
		try {
			await UsersRepository.save(user)
		} catch (e) {
			console.log(e)
			throw new InternalServerErrorException()
		}
	}

	calculElo(eloPlayerWin: string, eloPlayerLoose: string): number {
		const EloRating = require('elo-rating')

		const elo = EloRating.calculate(
			parseInt(eloPlayerWin),
			parseInt(eloPlayerLoose),
		)
		return elo.playerRating - parseInt(eloPlayerWin)
	}
}
