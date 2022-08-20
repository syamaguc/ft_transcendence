import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppDataSource } from './app/app.datasource';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	// check ENV
	console.log(process.env);
	const app = await NestFactory.create(AppModule);
	AppDataSource.initialize()
		.then(() => {
			console.log('Data Source has been initialized!');
		})
		.catch((err) => {
			console.error('Error during Data Source initialization', err);
		});

	app.enableCors({
		origin: true,
		credentials: true,
	});

	app.use(cookieParser());

	const config = new DocumentBuilder()
		.setTitle('ft_transcendence')
		.setDescription('Pong')
		.setVersion('1.0')
		.addTag('Pong')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	app.useGlobalPipes(new ValidationPipe());

	await app.listen(3000);
}
bootstrap();
