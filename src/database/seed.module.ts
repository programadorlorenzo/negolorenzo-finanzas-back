import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedService } from './seeds/seed.service';
import { SeedsController } from './seeds/seeds.controller';
import {
	User,
	Sucursal,
	Role,
	Permission,
	RolePermission,
	UserSucursal,
	RefreshToken,
	AuditLog,
	Cuenta,
} from '../entities';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DATABASE_HOST', 'localhost'),
				port: configService.get('DATABASE_PORT', 5432),
				username: configService.get('DATABASE_USERNAME', 'programadorlorenzo'),
				password: configService.get('DATABASE_PASSWORD', ''),
				database: configService.get('DATABASE_NAME', 'negofinanzas'),
				entities: [
					User,
					Sucursal,
					Role,
					Permission,
					RolePermission,
					UserSucursal,
					RefreshToken,
					AuditLog,
					Cuenta,
				],
				synchronize: configService.get('NODE_ENV') !== 'production',
			}),
			inject: [ConfigService],
		}),
		TypeOrmModule.forFeature([
			User,
			Sucursal,
			Role,
			Permission,
			RolePermission,
			UserSucursal,
			RefreshToken,
			AuditLog,
			Cuenta,
		]),
	],
	controllers: [SeedsController],
	providers: [SeedService],
})
export class SeedModule {}
