import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
