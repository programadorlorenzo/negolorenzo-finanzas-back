import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role, Sucursal, UserSucursal } from '../../entities';
import * as argon2 from 'argon2';

@Injectable()
export class SeedService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Role)
		private roleRepository: Repository<Role>,
		@InjectRepository(Sucursal)
		private sucursalRepository: Repository<Sucursal>,
		@InjectRepository(UserSucursal)
		private userSucursalRepository: Repository<UserSucursal>,
	) {}

	async run(): Promise<void> {
		console.log('🌱 Iniciando seeds...');

		// 1. Crear roles
		await this.createRoles();

		// 2. Crear sucursales
		await this.createSucursales();

		// 3. Crear usuarios
		await this.createUsers();

		// 4. Asignar usuarios a sucursales
		await this.assignUsersToSucursales();

		console.log('✅ Seeds completados exitosamente');
	}

	private async createRoles(): Promise<void> {
		console.log('👑 Creando roles...');

		const roles = [
			{
				name: 'superadmin',
				description: 'Super administrador - maneja todas las sucursales con permisos completos',
			},
			{
				name: 'admin',
				description: 'Administrador - maneja todas las sucursales con permisos limitados',
			},
			{
				name: 'jefetienda',
				description: 'Jefe de tienda - maneja solo una sucursal específica',
			},
		];

		for (const roleData of roles) {
			const existingRole = await this.roleRepository.findOne({
				where: { name: roleData.name },
			});

			if (!existingRole) {
				const role = this.roleRepository.create(roleData);
				await this.roleRepository.save(role);
				console.log(`   ✓ Rol creado: ${roleData.name}`);
			} else {
				console.log(`   - Rol ya existe: ${roleData.name}`);
			}
		}
	}

	private async createSucursales(): Promise<void> {
		console.log('🏪 Creando sucursales...');

		const sucursales = [
			{ name: 'TAMAYO', code: 'TAM' },
			{ name: 'CHACARILLA', code: 'CHA' },
			{ name: 'REP. PANAMÁ', code: 'PAN' },
			{ name: 'TARATA', code: 'TAR' },
		];

		for (const sucursalData of sucursales) {
			const existingSucursal = await this.sucursalRepository.findOne({
				where: { name: sucursalData.name },
			});

			if (!existingSucursal) {
				const sucursal = this.sucursalRepository.create({
					...sucursalData,
					isActive: true,
				});
				await this.sucursalRepository.save(sucursal);
				console.log(`   ✓ Sucursal creada: ${sucursalData.name}`);
			} else {
				console.log(`   - Sucursal ya existe: ${sucursalData.name}`);
			}
		}
	}

	private async createUsers(): Promise<void> {
		console.log('👥 Creando usuarios...');

		const defaultPassword = await argon2.hash('123456'); // Contraseña temporal

		const users = [
			// Superadmins
			{
				email: 'sistemas@negolorenzo.pe',
				firstName: 'Sistemas',
				lastName: 'NegoLorenzo',
				password: defaultPassword,
				role: 'superadmin',
			},
			{
				email: 'anny@negolorenzo.pe',
				firstName: 'Srta.',
				lastName: 'Anny',
				password: defaultPassword,
				role: 'superadmin',
			},
			// Admin
			{
				email: 'administrador@negolorenzo.pe',
				firstName: 'Administrador',
				lastName: 'General',
				password: defaultPassword,
				role: 'admin',
			},
			// Jefes de tienda
			{
				email: 'tamayo@negolorenzo.pe',
				firstName: 'Tamayo',
				lastName: 'Jefe Tienda',
				password: defaultPassword,
				role: 'jefetienda',
			},
			{
				email: 'chacarilla@negolorenzo.pe',
				firstName: 'Chacarilla',
				lastName: 'Jefe Tienda',
				password: defaultPassword,
				role: 'jefetienda',
			},
			{
				email: 'reppanama@negolorenzo.pe',
				firstName: 'Rep. Panamá',
				lastName: 'Jefe Tienda',
				password: defaultPassword,
				role: 'jefetienda',
			},
			{
				email: 'tarata@negolorenzo.pe',
				firstName: 'Tarata',
				lastName: 'Jefe Tienda',
				password: defaultPassword,
				role: 'jefetienda',
			},
		];

		for (const userData of users) {
			const existingUser = await this.userRepository.findOne({
				where: { email: userData.email },
			});

			if (!existingUser) {
				const user = this.userRepository.create(userData);
				await this.userRepository.save(user);
				console.log(`   ✓ Usuario creado: ${userData.email} (${userData.role})`);
			} else {
				console.log(`   - Usuario ya existe: ${userData.email}`);
			}
		}
	}

	private async assignUsersToSucursales(): Promise<void> {
		console.log('🔗 Asignando usuarios a sucursales...');

		// Obtener roles
		const superadminRole = await this.roleRepository.findOne({ where: { name: 'superadmin' } });
		const adminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
		const jefetiendaRole = await this.roleRepository.findOne({ where: { name: 'jefetienda' } });

		if (!superadminRole || !adminRole || !jefetiendaRole) {
			throw new Error('No se pudieron encontrar todos los roles necesarios');
		}

		// Obtener usuarios superadmin y admin usando el campo string
		const superadmins = await this.userRepository.find({ where: { role: 'superadmin' } });
		const admins = await this.userRepository.find({ where: { role: 'admin' } });

		// Obtener todas las sucursales
		const sucursales = await this.sucursalRepository.find();

		// Asignar superadmins a TODAS las sucursales con rol superadmin
		for (const user of superadmins) {
			for (const sucursal of sucursales) {
				const existingAssignment = await this.userSucursalRepository.findOne({
					where: { userId: user.id, sucursalId: sucursal.id },
				});

				if (!existingAssignment) {
					const assignment = this.userSucursalRepository.create({
						userId: user.id,
						sucursalId: sucursal.id,
						roleId: superadminRole.id,
					});
					await this.userSucursalRepository.save(assignment);
					console.log(`   ✓ ${user.email} asignado a sucursal: ${sucursal.name} (superadmin)`);
				}
			}
		}

		// Asignar admins a TODAS las sucursales con rol admin
		for (const user of admins) {
			for (const sucursal of sucursales) {
				const existingAssignment = await this.userSucursalRepository.findOne({
					where: { userId: user.id, sucursalId: sucursal.id },
				});

				if (!existingAssignment) {
					const assignment = this.userSucursalRepository.create({
						userId: user.id,
						sucursalId: sucursal.id,
						roleId: adminRole.id,
					});
					await this.userSucursalRepository.save(assignment);
					console.log(`   ✓ ${user.email} asignado a sucursal: ${sucursal.name} (admin)`);
				}
			}
		}

		// Asignar jefes de tienda a su sucursal específica
		const jefeAssignments = [
			{ email: 'tamayo@negolorenzo.pe', sucursalName: 'TAMAYO' },
			{ email: 'chacarilla@negolorenzo.pe', sucursalName: 'CHACARILLA' },
			{ email: 'reppanama@negolorenzo.pe', sucursalName: 'REP. PANAMÁ' },
			{ email: 'tarata@negolorenzo.pe', sucursalName: 'TARATA' },
		];

		for (const assignment of jefeAssignments) {
			const user = await this.userRepository.findOne({ where: { email: assignment.email } });
			const sucursal = await this.sucursalRepository.findOne({
				where: { name: assignment.sucursalName },
			});

			if (user && sucursal) {
				const existingAssignment = await this.userSucursalRepository.findOne({
					where: { userId: user.id, sucursalId: sucursal.id },
				});

				if (!existingAssignment) {
					const userSucursal = this.userSucursalRepository.create({
						userId: user.id,
						sucursalId: sucursal.id,
						roleId: jefetiendaRole.id,
					});
					await this.userSucursalRepository.save(userSucursal);
					console.log(
						`   ✓ Jefe ${user.email} asignado a sucursal específica: ${sucursal.name} (jefetienda)`,
					);
				}
			}
		}

		console.log('📊 Resumen de asignaciones:');
		console.log(`   - Superadmins y Admins: acceso a ${sucursales.length} sucursales`);
		console.log(`   - Jefes de tienda: acceso a 1 sucursal específica cada uno`);
		console.log('📝 IMPORTANTE: Todos los usuarios tienen contraseña temporal "123456"');
	}
}
