import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import {
	Organization,
	Sucursal,
	Role,
	Permission,
	RolePermission,
	User,
	UserOrganization,
	UserStatus,
	Cuenta,
	TipoCuenta,
	Moneda,
} from '../../entities';

@Injectable()
export class SeedService {
	private readonly logger = new Logger(SeedService.name);

	constructor(
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
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(UserOrganization)
		private userOrganizationRepository: Repository<UserOrganization>,
		@InjectRepository(Cuenta)
		private cuentaRepository: Repository<Cuenta>,
	) {}

	async run(): Promise<void> {
		this.logger.log('🌱 Starting database seeding...');

		try {
			await this.seedPermissions();
			await this.seedRoles();
			await this.seedRolePermissions();
			await this.seedOrganizations();
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
			// User permissions
			{ name: 'user.create', resource: 'user', action: 'create', description: 'Create users' },
			{ name: 'user.read', resource: 'user', action: 'read', description: 'Read users' },
			{ name: 'user.update', resource: 'user', action: 'update', description: 'Update users' },
			{ name: 'user.delete', resource: 'user', action: 'delete', description: 'Delete users' },

			// Organization permissions
			{
				name: 'organization.create',
				resource: 'organization',
				action: 'create',
				description: 'Create organizations',
			},
			{
				name: 'organization.read',
				resource: 'organization',
				action: 'read',
				description: 'Read organizations',
			},
			{
				name: 'organization.update',
				resource: 'organization',
				action: 'update',
				description: 'Update organizations',
			},
			{
				name: 'organization.delete',
				resource: 'organization',
				action: 'delete',
				description: 'Delete organizations',
			},

			// Sucursal permissions
			{
				name: 'sucursal.create',
				resource: 'sucursal',
				action: 'create',
				description: 'Create sucursales',
			},
			{
				name: 'sucursal.read',
				resource: 'sucursal',
				action: 'read',
				description: 'Read sucursales',
			},
			{
				name: 'sucursal.update',
				resource: 'sucursal',
				action: 'update',
				description: 'Update sucursales',
			},
			{
				name: 'sucursal.delete',
				resource: 'sucursal',
				action: 'delete',
				description: 'Delete sucursales',
			},

			// Cuenta permissions
			{
				name: 'cuenta.create',
				resource: 'cuenta',
				action: 'create',
				description: 'Create cuentas',
			},
			{ name: 'cuenta.read', resource: 'cuenta', action: 'read', description: 'Read cuentas' },
			{
				name: 'cuenta.update',
				resource: 'cuenta',
				action: 'update',
				description: 'Update cuentas',
			},
			{
				name: 'cuenta.delete',
				resource: 'cuenta',
				action: 'delete',
				description: 'Delete cuentas',
			},

			// Report permissions
			{ name: 'report.read', resource: 'report', action: 'read', description: 'Read reports' },
			{
				name: 'report.create',
				resource: 'report',
				action: 'create',
				description: 'Create reports',
			},

			// Role permissions
			{ name: 'role.create', resource: 'role', action: 'create', description: 'Create roles' },
			{ name: 'role.read', resource: 'role', action: 'read', description: 'Read roles' },
			{ name: 'role.update', resource: 'role', action: 'update', description: 'Update roles' },
			{ name: 'role.delete', resource: 'role', action: 'delete', description: 'Delete roles' },
		];

		for (const permissionData of permissions) {
			const existingPermission = await this.permissionRepository.findOne({
				where: { name: permissionData.name },
			});

			if (!existingPermission) {
				const permission = this.permissionRepository.create(permissionData);
				await this.permissionRepository.save(permission);
				this.logger.log(`  📄 Created permission: ${permissionData.name}`);
			}
		}
	}

	private async seedRoles(): Promise<void> {
		this.logger.log('🎭 Seeding roles...');

		const roles = [
			{
				name: 'SUPERADMIN',
				description: 'Super administrador con acceso total al sistema',
			},
			{
				name: 'ADMIN',
				description: 'Administrador con acceso a todas las sucursales',
			},
			{
				name: 'MANAGER',
				description: 'Manager de sucursal con acceso limitado a su sucursal',
			},
		];

		for (const roleData of roles) {
			const existingRole = await this.roleRepository.findOne({
				where: { name: roleData.name },
			});

			if (!existingRole) {
				const role = this.roleRepository.create(roleData);
				await this.roleRepository.save(role);
				this.logger.log(`  👑 Created role: ${roleData.name}`);
			}
		}
	}

	private async seedRolePermissions(): Promise<void> {
		this.logger.log('🔗 Seeding role permissions...');

		const rolePermissionMappings = {
			SUPERADMIN: [
				// SuperAdmin has all permissions
				'user.create',
				'user.read',
				'user.update',
				'user.delete',
				'organization.create',
				'organization.read',
				'organization.update',
				'organization.delete',
				'sucursal.create',
				'sucursal.read',
				'sucursal.update',
				'sucursal.delete',
				'cuenta.create',
				'cuenta.read',
				'cuenta.update',
				'cuenta.delete',
				'report.read',
				'report.create',
				'role.create',
				'role.read',
				'role.update',
				'role.delete',
			],
			ADMIN: [
				// Admin can manage all sucursales but not create organizations
				'user.create',
				'user.read',
				'user.update',
				'organization.read',
				'sucursal.read',
				'sucursal.update',
				'cuenta.create',
				'cuenta.read',
				'cuenta.update',
				'cuenta.delete',
				'report.read',
				'report.create',
			],
			MANAGER: [
				// Manager can only manage their sucursal
				'user.read',
				'sucursal.read',
				'cuenta.create',
				'cuenta.read',
				'cuenta.update',
				'report.read',
			],
		};

		for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
			const role = await this.roleRepository.findOne({ where: { name: roleName } });
			if (!role) continue;

			for (const permissionName of permissionNames) {
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
				}
			}

			this.logger.log(`  🔗 Assigned ${permissionNames.length} permissions to role: ${roleName}`);
		}
	}

	private async seedOrganizations(): Promise<void> {
		this.logger.log('🏢 Seeding organizations...');

		const organizations = [
			{
				name: 'Consorcio Lorenzo',
				code: 'CLZ',
				description: 'Consorcio principal de Lorenzo',
			},
		];

		for (const orgData of organizations) {
			const existingOrg = await this.organizationRepository.findOne({
				where: { code: orgData.code },
			});

			if (!existingOrg) {
				const organization = this.organizationRepository.create(orgData);
				await this.organizationRepository.save(organization);
				this.logger.log(`  🏢 Created organization: ${orgData.name}`);
			}
		}
	}

	private async seedSucursales(): Promise<void> {
		this.logger.log('🌿 Seeding sucursales...');

		const consorcioLorenzo = await this.organizationRepository.findOne({
			where: { code: 'CLZ' },
		});

		if (!consorcioLorenzo) {
			this.logger.warn('Organization not found, skipping sucursal seeding');
			return;
		}

		const sucursales = [
			{
				name: 'Sucursal Central',
				code: 'CENTRAL',
				address: 'Av. Principal 123, Lima',
				phone: '+51-1-234-5678',
				organizationId: consorcioLorenzo.id,
			},
			{
				name: 'Sucursal Norte',
				code: 'NORTE',
				address: 'Av. Norte 456, Lima',
				phone: '+51-1-234-5679',
				organizationId: consorcioLorenzo.id,
			},
		];

		for (const sucursalData of sucursales) {
			const existingSucursal = await this.sucursalRepository.findOne({
				where: { code: sucursalData.code, organizationId: sucursalData.organizationId },
			});

			if (!existingSucursal) {
				const sucursal = this.sucursalRepository.create(sucursalData);
				await this.sucursalRepository.save(sucursal);
				this.logger.log(`  🌿 Created sucursal: ${sucursalData.name}`);
			}
		}
	}

	private async seedUsers(): Promise<void> {
		this.logger.log('👥 Seeding users...');

		const superadminRole = await this.roleRepository.findOne({ where: { name: 'SUPERADMIN' } });
		const adminRole = await this.roleRepository.findOne({ where: { name: 'ADMIN' } });
		const managerRole = await this.roleRepository.findOne({ where: { name: 'MANAGER' } });

		const consorcioLorenzo = await this.organizationRepository.findOne({
			where: { code: 'CLZ' },
		});
		const centralSucursal = await this.sucursalRepository.findOne({
			where: { code: 'CENTRAL' },
		});
		const norteSucursal = await this.sucursalRepository.findOne({
			where: { code: 'NORTE' },
		});

		if (
			!superadminRole ||
			!adminRole ||
			!managerRole ||
			!consorcioLorenzo ||
			!centralSucursal ||
			!norteSucursal
		) {
			this.logger.warn('Required data not found, skipping user seeding');
			return;
		}

		const users = [
			// SuperAdmins
			{
				firstName: 'Walter',
				lastName: 'Lorenzo',
				email: 'walter@consorciolorenzo.com',
				password: 'Walter123!',
				phone: '+51-999-111-111',
				status: UserStatus.ACTIVE,
				role: superadminRole,
				organization: consorcioLorenzo,
				sucursal: centralSucursal,
			},
			{
				firstName: 'Anny',
				lastName: 'Lorenzo',
				email: 'anny@consorciolorenzo.com',
				password: 'Anny123!',
				phone: '+51-999-222-222',
				status: UserStatus.ACTIVE,
				role: superadminRole,
				organization: consorcioLorenzo,
				sucursal: centralSucursal,
			},
			// Admin
			{
				firstName: 'Cesar',
				lastName: 'Admin',
				email: 'cesar@consorciolorenzo.com',
				password: 'Cesar123!',
				phone: '+51-999-333-333',
				status: UserStatus.ACTIVE,
				role: adminRole,
				organization: consorcioLorenzo,
				sucursal: centralSucursal,
			},
			// Managers
			{
				firstName: 'Manager',
				lastName: 'Central',
				email: 'manager.central@consorciolorenzo.com',
				password: 'Manager123!',
				phone: '+51-999-444-444',
				status: UserStatus.ACTIVE,
				role: managerRole,
				organization: consorcioLorenzo,
				sucursal: centralSucursal,
			},
			{
				firstName: 'Manager',
				lastName: 'Norte',
				email: 'manager.norte@consorciolorenzo.com',
				password: 'Manager123!',
				phone: '+51-999-555-555',
				status: UserStatus.ACTIVE,
				role: managerRole,
				organization: consorcioLorenzo,
				sucursal: norteSucursal,
			},
		];

		for (const userData of users) {
			const existingUser = await this.userRepository.findOne({
				where: { email: userData.email },
			});

			if (!existingUser) {
				// Hash password
				const hashedPassword = await argon2.hash(userData.password);

				// Create user
				const user = this.userRepository.create({
					firstName: userData.firstName,
					lastName: userData.lastName,
					email: userData.email,
					password: hashedPassword,
					status: userData.status,
				});

				const savedUser = await this.userRepository.save(user);

				// Create user-organization relationship
				const userOrganization = this.userOrganizationRepository.create({
					userId: savedUser.id,
					organizationId: userData.organization.id,
					sucursalId: userData.sucursal.id,
					roleId: userData.role.id,
				});

				await this.userOrganizationRepository.save(userOrganization);

				this.logger.log(`  👤 Created user: ${userData.email} (${userData.role.name})`);
			}
		}
	}

	private async seedCuentas(): Promise<void> {
		this.logger.log('💳 Seeding cuentas...');

		// Get users for creating sample accounts
		const walter = await this.userRepository.findOne({
			where: { email: 'walter@consorciolorenzo.com' },
		});
		const cesar = await this.userRepository.findOne({
			where: { email: 'cesar@consorciolorenzo.com' },
		});
		const consorcioLorenzo = await this.organizationRepository.findOne({ where: { code: 'CLZ' } });

		if (!walter || !cesar || !consorcioLorenzo) {
			this.logger.warn('Required users not found, skipping cuenta seeding');
			return;
		}

		const cuentas = [
			{
				titular: 'Walter Lorenzo',
				numeroCuenta: '191-12345678-001',
				cci: '00219100123456780013',
				moneda: Moneda.PEN,
				tipo: TipoCuenta.AHORROS,
				banco: 'Banco de Crédito del Perú',
				esEmpresa: false,
				saldo: 15000.0,
				createdBy: walter.id,
				organizationId: undefined,
			},
			{
				titular: 'Consorcio Lorenzo SAC',
				numeroCuenta: '191-87654321-002',
				cci: '00219100876543210025',
				moneda: Moneda.PEN,
				tipo: TipoCuenta.EMPRESA,
				banco: 'Banco de Crédito del Perú',
				esEmpresa: true,
				saldo: 250000.0,
				createdBy: walter.id,
				organizationId: consorcioLorenzo.id,
			},
			{
				titular: 'Consorcio Lorenzo USD',
				numeroCuenta: '191-11111111-003',
				cci: '00219100111111110037',
				moneda: Moneda.USD,
				tipo: TipoCuenta.EMPRESA,
				banco: 'Banco de Crédito del Perú',
				esEmpresa: true,
				saldo: 50000.0,
				createdBy: cesar.id,
				organizationId: consorcioLorenzo.id,
			},
		];

		for (const cuentaData of cuentas) {
			const existingCuenta = await this.cuentaRepository.findOne({
				where: { numeroCuenta: cuentaData.numeroCuenta },
			});

			if (!existingCuenta) {
				const cuenta = this.cuentaRepository.create(cuentaData);
				await this.cuentaRepository.save(cuenta);
				this.logger.log(`  💳 Created cuenta: ${cuentaData.titular} - ${cuentaData.numeroCuenta}`);
			}
		}
	}
}
