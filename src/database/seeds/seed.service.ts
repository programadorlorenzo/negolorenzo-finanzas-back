import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import {
	Sucursal,
	Role,
	Permission,
	RolePermission,
	User,
	UserSucursal,
	Cuenta,
	TipoCuenta,
	Moneda,
	UserStatus,
} from '../../entities';

@Injectable()
export class SeedService {
	private readonly logger = new Logger(SeedService.name);

	constructor(
		@InjectRepository(Sucursal)
		private sucursalRepository: Repository<Sucursal>,
		@InjectRepository(Role)
		private roleRepository: Repository<Role>,
		@InjectRepository(Permission)
		private permissionRepository: Repository<Permission>,
		@InjectRepository(RolePermission)
		private rolePermissionRepository: Repository<RolePermission>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(UserSucursal)
		private userSucursalRepository: Repository<UserSucursal>,
		@InjectRepository(Cuenta)
		private cuentaRepository: Repository<Cuenta>,
	) {}

	async run(): Promise<void> {
		this.logger.log('🌱 Starting database seeding...');

		try {
			await this.seedPermissions();
			await this.seedRoles();
			await this.seedRolePermissions();
			await this.seedSucursales();
			await this.seedUsers();
			await this.seedCuentas();

			this.logger.log('✅ Database seeding completed successfully!');
		} catch (error) {
			this.logger.error('❌ Database seeding failed:', error);
			throw error;
		}
	}

	private async seedPermissions(): Promise<void> {
		this.logger.log('📋 Seeding permissions...');

		const permissions = [
			{
				name: 'manage_users',
				resource: 'users',
				action: 'manage',
				description: 'Gestionar usuarios',
			},
			{
				name: 'manage_accounts',
				resource: 'accounts',
				action: 'manage',
				description: 'Gestionar cuentas',
			},
			{
				name: 'view_reports',
				resource: 'reports',
				action: 'view',
				description: 'Ver reportes',
			},
			{
				name: 'manage_branches',
				resource: 'branches',
				action: 'manage',
				description: 'Gestionar sucursales',
			},
		];

		for (const permissionData of permissions) {
			const existingPermission = await this.permissionRepository.findOne({
				where: { name: permissionData.name },
			});

			if (!existingPermission) {
				const permission = this.permissionRepository.create(permissionData);
				await this.permissionRepository.save(permission);
				this.logger.log(`   ✓ Permission created: ${permissionData.name}`);
			} else {
				this.logger.log(`   → Permission already exists: ${permissionData.name}`);
			}
		}
	}

	private async seedRoles(): Promise<void> {
		this.logger.log('👥 Seeding roles...');

		const roles = [
			{ name: 'SUPERADMIN', description: 'Super Administrador del sistema' },
			{ name: 'ADMIN', description: 'Administrador' },
			{ name: 'MANAGER', description: 'Gerente' },
			{ name: 'USER', description: 'Usuario normal' },
		];

		for (const roleData of roles) {
			const existingRole = await this.roleRepository.findOne({
				where: { name: roleData.name },
			});

			if (!existingRole) {
				const role = this.roleRepository.create(roleData);
				await this.roleRepository.save(role);
				this.logger.log(`   ✓ Role created: ${roleData.name}`);
			} else {
				this.logger.log(`   → Role already exists: ${roleData.name}`);
			}
		}
	}

	private async seedRolePermissions(): Promise<void> {
		this.logger.log('🔗 Seeding role permissions...');

		const rolePermissionMappings = [
			{
				roleName: 'SUPERADMIN',
				permissionNames: ['manage_users', 'manage_accounts', 'view_reports', 'manage_branches'],
			},
			{ roleName: 'ADMIN', permissionNames: ['manage_users', 'manage_accounts', 'view_reports'] },
			{ roleName: 'MANAGER', permissionNames: ['manage_accounts', 'view_reports'] },
			{ roleName: 'USER', permissionNames: ['view_reports'] },
		];

		for (const mapping of rolePermissionMappings) {
			const role = await this.roleRepository.findOne({ where: { name: mapping.roleName } });
			if (!role) continue;

			for (const permissionName of mapping.permissionNames) {
				const permission = await this.permissionRepository.findOne({
					where: { name: permissionName },
				});
				if (!permission) continue;

				const existingRolePermission = await this.rolePermissionRepository.findOne({
					where: { roleId: role.id, permissionId: permission.id },
				});

				if (!existingRolePermission) {
					const rolePermission = this.rolePermissionRepository.create({
						roleId: role.id,
						permissionId: permission.id,
					});
					await this.rolePermissionRepository.save(rolePermission);
					this.logger.log(`   ✓ Role permission created: ${role.name} -> ${permission.name}`);
				}
			}
		}
	}

	private async seedCuentas(): Promise<void> {
		this.logger.log('💰 Seeding cuentas...');

		const cuentas = [
			{
				titular: 'Caja General',
				numeroCuenta: '1001',
				tipo: TipoCuenta.AHORROS,
				moneda: Moneda.PEN,
				isActive: true,
			},
			{
				titular: 'Banco Continental',
				numeroCuenta: '1102',
				tipo: TipoCuenta.CORRIENTE,
				moneda: Moneda.USD,
				isActive: true,
			},
		];

		for (const cuentaData of cuentas) {
			const existingCuenta = await this.cuentaRepository.findOne({
				where: { numeroCuenta: cuentaData.numeroCuenta },
			});

			if (!existingCuenta) {
				const cuenta = this.cuentaRepository.create(cuentaData);
				await this.cuentaRepository.save(cuenta);
				this.logger.log(`   ✓ Cuenta created: ${cuentaData.titular}`);
			} else {
				this.logger.log(`   → Cuenta already exists: ${cuentaData.titular}`);
			}
		}
	}

	private async seedSucursales(): Promise<void> {
		this.logger.log('🏢 Seeding sucursales...');

		const sucursales = [
			{
				name: 'Central',
				address: 'Av. Principal 123, Centro',
				isActive: true,
			},
			{
				name: 'Norte',
				address: 'Calle Norte 456, Zona Norte',
				isActive: true,
			},
		];

		for (const sucursalData of sucursales) {
			const existingSucursal = await this.sucursalRepository.findOne({
				where: { name: sucursalData.name },
			});

			if (!existingSucursal) {
				const sucursal = this.sucursalRepository.create(sucursalData);
				await this.sucursalRepository.save(sucursal);
				this.logger.log(`   ✓ Sucursal created: ${sucursalData.name}`);
			} else {
				this.logger.log(`   → Sucursal already exists: ${sucursalData.name}`);
			}
		}
	}

	private async seedUsers(): Promise<void> {
		this.logger.log('👤 Seeding users...');

		// Hash de contraseña por defecto
		const defaultPassword = await argon2.hash('password123');

		const users = [
			{
				email: 'admin@finanzas.com',
				firstName: 'Super',
				lastName: 'Admin',
				password: defaultPassword,
				role: 'SUPERADMIN',
				sucursales: ['Central', 'Norte'],
				permissions: ['manage_users', 'manage_accounts', 'view_reports', 'manage_branches'],
				status: UserStatus.ACTIVE,
			},
			{
				email: 'manager@finanzas.com',
				firstName: 'Manager',
				lastName: 'Principal',
				password: defaultPassword,
				role: 'MANAGER',
				sucursales: ['Central'],
				permissions: ['manage_accounts', 'view_reports'],
				status: UserStatus.ACTIVE,
			},
		];

		for (const userData of users) {
			const existingUser = await this.userRepository.findOne({
				where: { email: userData.email },
			});

			if (!existingUser) {
				const user = this.userRepository.create({
					email: userData.email,
					firstName: userData.firstName,
					lastName: userData.lastName,
					password: userData.password,
					role: userData.role,
					sucursales: userData.sucursales,
					permissions: userData.permissions,
					status: userData.status,
				});

				await this.userRepository.save(user);
				this.logger.log(`   ✓ User created: ${userData.email}`);
			} else {
				this.logger.log(`   → User already exists: ${userData.email}`);
			}
		}
	}
}
