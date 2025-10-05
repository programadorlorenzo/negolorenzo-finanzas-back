import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CuentasModule } from './cuentas/cuentas.module';
import * as entities from './entities';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DATABASE_HOST'),
				port: configService.get('DATABASE_PORT'),
				username: configService.get('DATABASE_USERNAME'),
				password: configService.get('DATABASE_PASSWORD'),
				database: configService.get('DATABASE_NAME'),
				entities: [
					entities.Organization,
					entities.Sucursal,
					entities.User,
					entities.Role,
					entities.Permission,
					entities.RolePermission,
					entities.UserOrganization,
					entities.RefreshToken,
					entities.AuditLog,
					entities.Cuenta,
				],
				synchronize: configService.get('NODE_ENV') === 'development',
				logging: configService.get('NODE_ENV') === 'development',
			}),
			inject: [ConfigService],
		}),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => [
				{
					ttl: configService.get('THROTTLE_TTL') || 60000,
					limit: configService.get('THROTTLE_LIMIT') || 10,
				},
			],
			inject: [ConfigService],
		}),
		AuthModule,
		CuentasModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
