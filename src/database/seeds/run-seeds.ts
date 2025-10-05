import { NestFactory } from '@nestjs/core';
import { SeedModule } from '../seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(SeedModule, {
		logger: ['error', 'warn', 'log'],
	});

	try {
		const seedService = app.get(SeedService);
		await seedService.run();
		console.log('✅ Seeds completed successfully');
		await app.close();
	} catch (error) {
		console.error('❌ Seeds failed:', error);
		await app.close();
		process.exit(1);
	}
}

bootstrap();
