import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm-config.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		/** env読み込み
		 *   環境変数NODE_ENVの値によって読み込むファイルを切り替える。
		 *   default.envは後続で呼ばれる。同じ変数がある場合は先に定義されているものが優先される。
		 */
		ConfigModule.forRoot({
			envFilePath: [
				`.env/${process.env.NODE_ENV}.env`,
				'.env/default.env',
			],
			isGlobal: true,
		}),
		// TypeORMの設定を非同期取得に変更
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useClass: TypeOrmConfigService,
		}),
		UsersModule,
		AuthModule,
	],
})
export class AppModule {}
