import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
	User,
	Organization,
	Sucursal,
	Role,
	Permission,
	RolePermission,
	UserOrganization,
	RefreshToken,
} from '../entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			RefreshToken,
			UserOrganization,
			Organization,
			Sucursal,
			Role,
			Permission,
			RolePermission,
		]),
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get('JWT_ACCESS_SECRET'),
				signOptions: {
					expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN'),
				},
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
