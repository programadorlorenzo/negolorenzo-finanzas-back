import {
	Injectable,
	UnauthorizedException,
	ConflictException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import {
	User,
	RefreshToken,
	UserOrganization,
	Organization,
	Sucursal,
	Role,
	Permission,
	RolePermission,
	UserStatus,
} from '../entities';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import {
	JwtPayload,
	LoginResponse,
	UserResponse,
	RefreshResponse,
	UserOrganizationResponse,
} from './interfaces/auth.interface';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(RefreshToken)
		private refreshTokenRepository: Repository<RefreshToken>,
		@InjectRepository(UserOrganization)
		private userOrganizationRepository: Repository<UserOrganization>,
		@InjectRepository(Organization)
		private organizationRepository: Repository<Organization>,
		@InjectRepository(Sucursal)
		private sucursalRepository: Repository<Sucursal>,
		@InjectRepository(Role)
		private roleRepository: Repository<Role>,
		@InjectRepository(Permission)
		private permissionRepository: Repository<Permission>,
		@InjectRepository(RolePermission)
		private rolePermissionRepository: Repository<RolePermission>,
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

		// Verificar que la organización existe
		const organization = await this.organizationRepository.findOne({
			where: { id: registerDto.organizationId },
		});

		if (!organization) {
			throw new NotFoundException('Organization not found');
		}

		// Verificar que el rol existe
		const role = await this.roleRepository.findOne({
			where: { id: registerDto.roleId },
		});

		if (!role) {
			throw new NotFoundException('Role not found');
		}

		// Verificar branch si se proporciona
		if (registerDto.sucursalId) {
			const sucursal = await this.sucursalRepository.findOne({
				where: { id: registerDto.sucursalId, organizationId: registerDto.organizationId },
			});

			if (!sucursal) {
				throw new BadRequestException('Sucursal not found');
			}
		}

		// Hash de la contraseña
		const hashedPassword = await argon2.hash(registerDto.password);

		// Crear usuario
		const user = this.userRepository.create({
			firstName: registerDto.firstName,
			lastName: registerDto.lastName,
			email: registerDto.email,
			password: hashedPassword,
		});

		const savedUser = await this.userRepository.save(user);

		// Crear relación usuario-organización
		const userOrganization = this.userOrganizationRepository.create({
			userId: savedUser.id,
			organizationId: registerDto.organizationId,
			sucursalId: registerDto.sucursalId,
			roleId: role.id,
		});
		await this.userOrganizationRepository.save(userOrganization);

		return this.buildUserResponse(savedUser);
	}

	async login(loginDto: LoginDto): Promise<LoginResponse> {
		const user = await this.userRepository.findOne({
			where: { email: loginDto.email },
		});

		if (!user || !(await argon2.verify(user.password, loginDto.password))) {
			throw new UnauthorizedException('Invalid credentials');
		}

		if (user.status !== UserStatus.ACTIVE) {
			throw new UnauthorizedException('Account is not active');
		}

		// Obtener organizaciones del usuario
		const userOrganizations = await this.getUserOrganizations(user.id);

		if (userOrganizations.length === 0) {
			throw new UnauthorizedException('User has no organization access');
		}

		// Usar la primera organización como default para el token
		const defaultOrg = userOrganizations[0];
		const permissions = await this.getUserPermissions(defaultOrg.roleId);

		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			orgId: defaultOrg.organizationId,
			sucursalId: defaultOrg.sucursalId,
			roles: [defaultOrg.roleName],
			permissions,
		};

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_ACCESS_SECRET'),
			expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
		});

		const refreshToken = await this.generateRefreshToken(user.id);

		// No actualizamos lastLoginAt ya que no existe en la entidad simplificada
		// await this.userRepository.update(user.id, { lastLoginAt: new Date() });

		const userResponse = await this.buildUserResponse(user);

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
		const userOrganizations = await this.getUserOrganizations(user.id);

		if (userOrganizations.length === 0) {
			throw new UnauthorizedException('User has no organization access');
		}

		const defaultOrg = userOrganizations[0];
		const permissions = await this.getUserPermissions(defaultOrg.roleId);

		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			orgId: defaultOrg.organizationId,
			sucursalId: defaultOrg.sucursalId,
			roles: [defaultOrg.roleName],
			permissions,
		};

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get('JWT_ACCESS_SECRET'),
			expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
		});

		// Revocar el refresh token actual y generar uno nuevo
		await this.refreshTokenRepository.update(refreshTokenRecord.id, { isRevoked: true });
		const newRefreshToken = await this.generateRefreshToken(user.id);

		return {
			accessToken,
			refreshToken: newRefreshToken,
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
		});

		if (!user || user.status !== UserStatus.ACTIVE) {
			throw new UnauthorizedException('User not found or inactive');
		}

		return user;
	}

	private async generateRefreshToken(userId: number): Promise<string> {
		const token = this.jwtService.sign(
			{ sub: userId },
			{
				secret: this.configService.get('JWT_REFRESH_SECRET'),
				expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
			},
		);

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

		await this.refreshTokenRepository.save({
			token,
			userId,
			expiresAt,
		});

		return token;
	}

	private async getUserOrganizations(userId: number): Promise<UserOrganizationResponse[]> {
		const userOrgs = await this.userOrganizationRepository.find({
			where: { userId, isActive: true },
			relations: ['organization', 'sucursal', 'role'],
		});

		return userOrgs.map(userOrg => ({
			id: userOrg.id,
			organizationId: userOrg.organizationId,
			organizationName: userOrg.organization.name,
			sucursalId: userOrg.sucursalId,
			sucursalName: userOrg.sucursal?.name,
			roleId: userOrg.roleId,
			roleName: userOrg.role.name,
			permissions: [], // Se llenará después
		}));
	}

	private async getUserPermissions(roleId: number): Promise<string[]> {
		const rolePermissions = await this.rolePermissionRepository.find({
			where: { roleId },
			relations: ['permission'],
		});

		return rolePermissions.filter(rp => rp.permission.isActive).map(rp => rp.permission.name);
	}

	private async buildUserResponse(user: User): Promise<UserResponse> {
		const organizations = await this.getUserOrganizations(user.id);

		// Obtener permisos para cada organización
		for (const org of organizations) {
			org.permissions = await this.getUserPermissions(org.roleId);
		}

		return {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			status: user.status,
			organizations,
		};
	}
}
