import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { Cuenta } from '../entities/cuenta.entity';
import type { AuthenticatedUser } from '../common/interfaces/user.interface';
import { CaslAbilityFactory } from 'src/permissions/casl-ability.factory';
import { Action } from 'src/permissions/permissions.types';

@Injectable()
export class CuentasService {
	constructor(
		@InjectRepository(Cuenta)
		private cuentasRepository: Repository<Cuenta>,
		private caslAbilityFactory: CaslAbilityFactory,
	) {}

	async create(createCuentaDto: CreateCuentaDto, userId: number): Promise<Cuenta> {
		const cuenta = this.cuentasRepository.create({
			titular: createCuentaDto.titular,
			numeroCuenta: createCuentaDto.numeroCuenta,
			cci: createCuentaDto.cci,
			moneda: createCuentaDto.moneda as any,
			tipo: createCuentaDto.tipo,
			createdBy: userId,
		});

		return this.cuentasRepository.save(cuenta);
	}

	async findAll(
		filters: { tipo?: string; moneda?: string; sucursalId?: string },
		user?: AuthenticatedUser,
	): Promise<Cuenta[]> {
		const query = this.cuentasRepository
			.createQueryBuilder('cuenta')
			.leftJoinAndSelect('cuenta.creator', 'user');

		// Apply filters
		if (filters.tipo) {
			query.andWhere('cuenta.tipo = :tipo', { tipo: filters.tipo });
		}
		if (filters.moneda) {
			query.andWhere('cuenta.moneda = :moneda', { moneda: filters.moneda });
		}
		if (filters.sucursalId) {
			query.andWhere('cuenta.sucursalId = :sucursalId', { sucursalId: filters.sucursalId });
		}

		const cuentas = await query.getMany();

		// Apply ABAC filtering if user is provided
		if (user) {
			const ability = this.caslAbilityFactory.createForUser(user);
			return cuentas.filter(cuenta => ability.can(Action.Read, cuenta));
		}

		return cuentas;
	}

	async findOne(id: number, user: AuthenticatedUser): Promise<Cuenta> {
		const cuenta = await this.cuentasRepository.findOne({
			where: { id },
			relations: ['creator'],
		});

		if (!cuenta) {
			throw new NotFoundException('Cuenta no encontrada');
		}

		// Check permissions
		const ability = this.caslAbilityFactory.createForUser(user);
		if (!ability.can(Action.Read, cuenta)) {
			throw new ForbiddenException('No tienes permisos para ver esta cuenta');
		}

		return cuenta;
	}

	async update(
		id: number,
		updateCuentaDto: UpdateCuentaDto,
		user: AuthenticatedUser,
	): Promise<Cuenta> {
		const cuenta = await this.findOne(id, user);

		// Check permissions
		const ability = this.caslAbilityFactory.createForUser(user);
		if (!ability.can(Action.Update, cuenta)) {
			throw new ForbiddenException('No tienes permisos para actualizar esta cuenta');
		}

		Object.assign(cuenta, updateCuentaDto);
		return this.cuentasRepository.save(cuenta);
	}

	async remove(id: number, user: AuthenticatedUser): Promise<void> {
		const cuenta = await this.findOne(id, user);

		// Check permissions
		const ability = this.caslAbilityFactory.createForUser(user);
		if (!ability.can(Action.Delete, cuenta)) {
			throw new ForbiddenException('No tienes permisos para eliminar esta cuenta');
		}

		await this.cuentasRepository.remove(cuenta);
	}

	async findUserCuentas(userId: number): Promise<Cuenta[]> {
		return this.cuentasRepository.find({
			where: { createdBy: userId },
			relations: ['creator'],
		});
	}

	async transferOwnership(
		id: number,
		newOwnerId: number,
		user: AuthenticatedUser,
	): Promise<Cuenta> {
		const cuenta = await this.findOne(id, user);

		// Check permissions
		const ability = this.caslAbilityFactory.createForUser(user);
		if (!ability.can(Action.Manage, cuenta)) {
			throw new ForbiddenException('No tienes permisos para transferir esta cuenta');
		}

		cuenta.createdBy = newOwnerId;
		return this.cuentasRepository.save(cuenta);
	}
}
