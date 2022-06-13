import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

	const app = await NestFactory.create(AppModule);
	const configService = new ConfigService();

	const sync = configService.get('DB_SYNC');
	console.log(`TypeORM synchronize is [ ${sync} ]`);

	const port = configService.get('API_PORT');
	await app.listen(port);
}
bootstrap();
