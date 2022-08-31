import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../user/user.module'
import { AuthModule } from '../auth/auth.module'
import { AdminModule } from 'src/admin/admin.module'
import { User } from '../user/entities/user.entity'
import { GameHistory } from '../game/entities/gameHistory.entity'
import { GameModule } from '../game/game.module'
import { ChatModule } from 'src/chat/chat.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [
				`.env/${process.env.NODE_ENV}.env`,
				'.env/default.env',
			],
			isGlobal: true,
		}),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: 5432,
			username: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			entities: [User, GameHistory],
			autoLoadEntities: true,
			synchronize: true,
		}),
		UserModule,
		AuthModule,
		AdminModule,
		GameModule,
		ChatModule,
	],
	providers: [],
})
export class AppModule {}
