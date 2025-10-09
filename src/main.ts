import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// CORS dinámico basado en entorno
	const corsOrigins =
		process.env.NODE_ENV === 'production'
			? ['https://finanzas.negolorenzo.pe', 'https://back-finanzas.negolorenzo.pe']
			: ['http://localhost:3000', 'http://localhost:3001'];

	console.log('🌐 CORS configured for origins:', corsOrigins);

	// Enable CORS
	app.enableCors({
		origin: corsOrigins,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	});

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// Swagger configuration
	const config = new DocumentBuilder()
		.setTitle('Finanzas API')
		.setDescription('API para sistema interno de gestión financiera')
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Enter JWT token',
				in: 'header',
			},
			'JWT-auth',
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
