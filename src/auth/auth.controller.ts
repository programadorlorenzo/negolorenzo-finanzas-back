import {
	Controller,
	Post,
	Body,
	UseGuards,
	Request,
	HttpCode,
	HttpStatus,
	Get,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginResponse, UserResponse, RefreshResponse } from './interfaces/auth.interface';
import type { AuthenticatedUser } from '../common/interfaces/user.interface';

@ApiTags('Authentication')
@Controller('auth')
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
export class AuthController {
	constructor(private authService: AuthService) {}

	@ApiOperation({ summary: 'Registrar nuevo usuario' })
	@ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
	@ApiResponse({ status: 400, description: 'Datos inválidos' })
	@ApiResponse({ status: 409, description: 'Email ya existe' })
	@Post('register')
	async register(@Body() registerDto: RegisterDto): Promise<UserResponse> {
		return this.authService.register(registerDto);
	}

	@ApiOperation({ summary: 'Iniciar sesión' })
	@ApiBody({ type: LoginDto })
	@ApiResponse({ status: 200, description: 'Login exitoso' })
	@ApiResponse({ status: 401, description: 'Credenciales inválidas' })
	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
		return this.authService.login(loginDto);
	}

	@ApiOperation({ summary: 'Renovar access token' })
	@ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
	@ApiResponse({ status: 401, description: 'Refresh token inválido' })
	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshResponse> {
		return this.authService.refresh(refreshTokenDto);
	}

	@ApiOperation({ summary: 'Cerrar sesión' })
	@ApiResponse({ status: 204, description: 'Logout exitoso' })
	@ApiResponse({ status: 401, description: 'No autorizado' })
	@ApiBearerAuth()
	@Post('logout')
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
		return this.authService.logout(refreshToken);
	}

	@ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
	@ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
	@ApiResponse({ status: 401, description: 'No autorizado' })
	@ApiBearerAuth()
	@Post('me')
	@UseGuards(JwtAuthGuard)
	getProfile(@Request() req: { user: AuthenticatedUser }): AuthenticatedUser {
		return req.user;
	}
}
