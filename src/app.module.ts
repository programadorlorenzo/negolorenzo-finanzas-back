import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { SucursalesModule } from './sucursales/sucursales.module';
import { FilesModule } from './files/files.module';
import { PagosModule } from './pagos/pagos.module';
import { SeedModule } from './database/seed.module';
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
					entities.Sucursal,
					entities.User,
					entities.Role,
					entities.Permission,
					entities.RolePermission,
					entities.UserSucursal,
					entities.RefreshToken,
					entities.AuditLog,
					entities.Cuenta,
					entities.File,
					entities.Pago,
					entities.PagoDocument,
				],
				synchronize: true, // TEMPORAL: Para crear tablas en producción
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
		SucursalesModule,
		FilesModule,
		PagosModule,
		SeedModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
