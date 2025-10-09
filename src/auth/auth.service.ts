import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User, RefreshToken, UserStatus } from '../entities';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import {
	JwtPayload,
	LoginResponse,
	UserResponse,
	RefreshResponse,
} from './interfaces/auth.interface';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(RefreshToken)
		private refreshTokenRepository: Repository<RefreshToken>,
		private jwtService: JwtService,
		private configService: ConfigService,
	) {}

	async register(registerDto: RegisterDto): Promise<UserResponse> {
		const existingUser = await this.userRepository.findOne({
			where: { email: registerDto.email },
		});

		if (existingUser) {
			throw new ConflictException('Email already exists');
		}

		// Hash de la contraseña
		const hashedPassword = await argon2.hash(registerDto.password);

		// Crear usuario con estructura simplificada
		const user = this.userRepository.create({
			firstName: registerDto.firstName,
			lastName: registerDto.lastName,
			email: registerDto.email,
			password: hashedPassword,
			role: registerDto.role || 'User',
			sucursales: registerDto.sucursales || [],
			permissions: registerDto.permissions || [],
		});

		const savedUser = await this.userRepository.save(user);

		return this.buildUserResponse(savedUser);
	}

	async login(loginDto: LoginDto): Promise<LoginResponse> {
		const user = await this.userRepository.findOne({
			where: { email: loginDto.email },
			relations: ['userSucursales', 'userSucursales.sucursal'],
		});

		if (!user || !(await argon2.verify(user.password, loginDto.password))) {
			throw new UnauthorizedException('Invalid credentials');
		}

		if (user.status !== UserStatus.ACTIVE) {
			throw new UnauthorizedException('Account is not active');
		}

		// Extraer nombres de sucursales de la relación
		const sucursalesNames = user.userSucursales?.map(us => us.sucursal.name) || [];

		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			role: user.role || 'User',
			sucursales: sucursalesNames,
			permissions: user.permissions || [],
		};

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_ACCESS_SECRET'),
			expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
		});

		const refreshToken = await this.generateRefreshToken(user.id);

		const userResponse = this.buildUserResponse(user);

		return {
			user: userResponse,
			accessToken,
			refreshToken,
		};
	}

	async refresh(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponse> {
		const refreshTokenRecord = await this.refreshTokenRepository.findOne({
			where: { token: refreshTokenDto.refreshToken, isRevoked: false },
			relations: ['user'],
		});

		if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
			throw new UnauthorizedException('Invalid or expired refresh token');
		}

		const user = refreshTokenRecord.user;

		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			role: user.role || 'User',
			sucursales: user.sucursales || [],
			permissions: user.permissions || [],
		};

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_ACCESS_SECRET'),
			expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
		});

		const newRefreshToken = await this.generateRefreshToken(user.id);

		// Revocar el token anterior
		refreshTokenRecord.isRevoked = true;
		await this.refreshTokenRepository.save(refreshTokenRecord);

		return {
			accessToken,
			refreshToken: newRefreshToken,
		};
	}

	private async generateRefreshToken(userId: number): Promise<string> {
		const token =
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

		const refreshToken = this.refreshTokenRepository.create({
			userId,
			token,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
		});

		await this.refreshTokenRepository.save(refreshToken);
		return token;
	}

	private buildUserResponse(user: User): UserResponse {
		// Extraer nombres de sucursales de la relación si están disponibles
		const sucursalesNames =
			user.userSucursales?.map(us => us.sucursal.name) || user.sucursales || [];

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			status: user.status,
			role: user.role || 'User',
			sucursales: sucursalesNames,
			permissions: user.permissions || [],
		};
	}

	async logout(refreshToken: string): Promise<void> {
		if (refreshToken) {
			await this.refreshTokenRepository.update({ token: refreshToken }, { isRevoked: true });
		}
	}

	async validateUser(payload: JwtPayload): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { id: payload.sub },
			relations: ['userSucursales', 'userSucursales.sucursal'],
		});

		if (!user || user.status !== UserStatus.ACTIVE) {
			throw new UnauthorizedException('User not found or inactive');
		}

		return user;
	}
}
