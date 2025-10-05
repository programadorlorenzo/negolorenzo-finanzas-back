import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import {
	User,
	Organization,
	Sucursal,
	Role,
	Permission,
	RolePermission,
	UserOrganization,
	RefreshToken,
	AuditLog,
	Cuenta,
} from '../entities';

// Cargar variables de entorno
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: configService.get<string>('DATABASE_HOST', 'localhost'),
	port: configService.get<number>('DATABASE_PORT', 5432),
	username: configService.get<string>('DATABASE_USERNAME', 'programadorlorenzo'),
	password: configService.get<string>('DATABASE_PASSWORD', ''),
	database: configService.get<string>('DATABASE_NAME', 'negofinanzas'),
	entities: [
		User,
		Organization,
		Sucursal,
		Role,
		Permission,
		RolePermission,
		UserOrganization,
		RefreshToken,
		AuditLog,
		Cuenta,
	],
	migrations: ['src/database/migrations/*{.ts,.js}'],
	synchronize: false, // Solo para desarrollo, usar migraciones en producción
	logging: configService.get<string>('NODE_ENV') === 'development',
});
