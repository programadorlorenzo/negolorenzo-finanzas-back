import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Cuenta } from '../entities/cuenta.entity';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { FilterCuentasDto } from './dto/filter-cuentas.dto';

export interface PaginatedResult<T> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

@Injectable()
export class CuentasService {
	constructor(
		@InjectRepository(Cuenta)
		private cuentaRepository: Repository<Cuenta>,
	) {}

	async create(createCuentaDto: CreateCuentaDto, userId?: number): Promise<Cuenta> {
		try {
			// Verificar si ya existe una cuenta con el mismo número de cuenta (si se proporciona)
			if (
				createCuentaDto.numeroCuenta &&
				(await this.numeroCuentaExists(createCuentaDto.numeroCuenta))
			) {
				throw new ConflictException(
					`Ya existe una cuenta con el número '${createCuentaDto.numeroCuenta}'`,
				);
			}

			// Verificar si ya existe una cuenta con el mismo CCI (si se proporciona)
			if (createCuentaDto.cci && (await this.cciExists(createCuentaDto.cci))) {
				throw new ConflictException(`Ya existe una cuenta con el CCI '${createCuentaDto.cci}'`);
			}

			const cuenta = this.cuentaRepository.create({
				...createCuentaDto,
				isActive: createCuentaDto.isActive ?? true,
				createdBy: userId,
			});

			return await this.cuentaRepository.save(cuenta);
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}

			if (error instanceof QueryFailedError) {
				// Manejar errores de base de datos específicos
				if (error.message.includes('unique constraint')) {
					throw new ConflictException('Ya existe una cuenta con esos datos');
				}
			}

			throw new BadRequestException('Error al crear la cuenta');
		}
	}

	async findAll(filters: FilterCuentasDto = {}): Promise<PaginatedResult<Cuenta>> {
		try {
			const {
				search,
				moneda,
				tipo,
				banco,
				esEmpresa,
				isActive,
				sucursalId,
				page = 1,
				limit = 10,
				sortBy = 'createdAt',
				sortOrder = 'DESC',
			} = filters;

			const queryBuilder = this.cuentaRepository
				.createQueryBuilder('cuenta')
				.leftJoinAndSelect('cuenta.creator', 'creator')
				.leftJoinAndSelect('cuenta.sucursal', 'sucursal');

			// Aplicar filtros de búsqueda
			if (search) {
				queryBuilder.andWhere(
					'(cuenta.titular ILIKE :search OR cuenta.numeroCuenta ILIKE :search OR cuenta.cci ILIKE :search OR cuenta.banco ILIKE :search)',
					{ search: `%${search}%` },
				);
			}

			if (moneda) {
				queryBuilder.andWhere('cuenta.moneda = :moneda', { moneda });
			}

			if (tipo) {
				queryBuilder.andWhere('cuenta.tipo = :tipo', { tipo });
			}

			if (banco) {
				queryBuilder.andWhere('cuenta.banco ILIKE :banco', { banco: `%${banco}%` });
			}

			if (esEmpresa !== undefined) {
				queryBuilder.andWhere('cuenta.esEmpresa = :esEmpresa', { esEmpresa });
			}

			if (isActive !== undefined) {
				queryBuilder.andWhere('cuenta.isActive = :isActive', { isActive });
			}

			if (sucursalId !== undefined) {
				if (sucursalId === null) {
					// Filtrar cuentas universales (sin sucursal)
					queryBuilder.andWhere('cuenta.sucursalId IS NULL');
				} else {
					// Filtrar cuentas de una sucursal específica
					queryBuilder.andWhere('cuenta.sucursalId = :sucursalId', { sucursalId });
				}
			}

			// Aplicar ordenamiento
			const validSortFields = ['id', 'titular', 'numeroCuenta', 'banco', 'createdAt', 'updatedAt'];
			const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
			queryBuilder.orderBy(`cuenta.${sortField}`, sortOrder);

			// Aplicar paginación
			const offset = (page - 1) * limit;
			queryBuilder.skip(offset).take(limit);

			// Obtener resultados y total
			const [data, total] = await queryBuilder.getManyAndCount();
			const totalPages = Math.ceil(total / limit);

			return {
				data,
				pagination: {
					total,
					page,
					limit,
					totalPages,
				},
			};
		} catch {
			throw new BadRequestException('Error al obtener las cuentas');
		}
	}

	async findOne(id: number): Promise<Cuenta> {
		try {
			const cuenta = await this.cuentaRepository.findOne({
				where: { id },
				relations: ['creator'],
			});

			if (!cuenta) {
				throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
			}

			return cuenta;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException('Error al obtener la cuenta');
		}
	}

	async update(id: number, updateCuentaDto: UpdateCuentaDto): Promise<Cuenta> {
		try {
			// Verificar si la cuenta existe
			const existingCuenta = await this.cuentaRepository.findOne({
				where: { id },
			});

			if (!existingCuenta) {
				throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
			}

			// Verificar si el número de cuenta ya existe en otra cuenta
			if (
				updateCuentaDto.numeroCuenta &&
				updateCuentaDto.numeroCuenta !== existingCuenta.numeroCuenta &&
				(await this.numeroCuentaExists(updateCuentaDto.numeroCuenta, id))
			) {
				throw new ConflictException(
					`Ya existe otra cuenta con el número '${updateCuentaDto.numeroCuenta}'`,
				);
			}

			// Verificar si el CCI ya existe en otra cuenta
			if (
				updateCuentaDto.cci &&
				updateCuentaDto.cci !== existingCuenta.cci &&
				(await this.cciExists(updateCuentaDto.cci, id))
			) {
				throw new ConflictException(`Ya existe otra cuenta con el CCI '${updateCuentaDto.cci}'`);
			}

			// Actualizar la cuenta
			await this.cuentaRepository.update(id, updateCuentaDto);

			// Retornar la cuenta actualizada
			const updatedCuenta = await this.cuentaRepository.findOne({
				where: { id },
				relations: ['creator'],
			});

			if (!updatedCuenta) {
				throw new NotFoundException(`Cuenta con ID ${id} no encontrada después de actualizar`);
			}

			return updatedCuenta;
		} catch (error) {
			if (error instanceof NotFoundException || error instanceof ConflictException) {
				throw error;
			}

			if (error instanceof QueryFailedError) {
				// Manejar errores de base de datos específicos
				if (error.message.includes('unique constraint')) {
					throw new ConflictException('Ya existe una cuenta con esos datos');
				}
			}

			throw new BadRequestException('Error al actualizar la cuenta');
		}
	}

	async remove(id: number): Promise<void> {
		try {
			const cuenta = await this.cuentaRepository.findOne({
				where: { id },
			});

			if (!cuenta) {
				throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
			}

			// Soft delete: marcar como inactiva en lugar de eliminar físicamente
			await this.cuentaRepository.update(id, { isActive: false });
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new BadRequestException('Error al eliminar la cuenta');
		}
	}

	async toggleStatus(id: number): Promise<Cuenta> {
		try {
			const cuenta = await this.cuentaRepository.findOne({
				where: { id },
			});

			if (!cuenta) {
				throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
			}

			// Cambiar el estado activo/inactivo
			await this.cuentaRepository.update(id, {
				isActive: !cuenta.isActive,
			});

			// Retornar la cuenta actualizada
			const updatedCuenta = await this.cuentaRepository.findOne({
				where: { id },
				relations: ['creator'],
			});

			if (!updatedCuenta) {
				throw new NotFoundException(`Cuenta con ID ${id} no encontrada después de actualizar`);
			}

			return updatedCuenta;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new BadRequestException('Error al cambiar el estado de la cuenta');
		}
	}

	async findActiveCuentas(): Promise<Cuenta[]> {
		try {
			return await this.cuentaRepository.find({
				where: { isActive: true },
				order: { titular: 'ASC' },
				relations: ['creator'],
			});
		} catch {
			throw new BadRequestException('Error al obtener las cuentas activas');
		}
	}

	/**
	 * Verifica si un número de cuenta ya existe
	 * @param numeroCuenta Número de cuenta a verificar
	 * @param excludeId ID de cuenta a excluir de la verificación (opcional)
	 * @returns true si el número ya existe, false en caso contrario
	 */
	private async numeroCuentaExists(numeroCuenta: string, excludeId?: number): Promise<boolean> {
		const queryBuilder = this.cuentaRepository
			.createQueryBuilder('cuenta')
			.where('cuenta.numeroCuenta = :numeroCuenta', { numeroCuenta });

		if (excludeId) {
			queryBuilder.andWhere('cuenta.id != :excludeId', { excludeId });
		}

		const existingCuenta = await queryBuilder.getOne();
		return !!existingCuenta;
	}

	/**
	 * Verifica si un CCI ya existe
	 * @param cci CCI a verificar
	 * @param excludeId ID de cuenta a excluir de la verificación (opcional)
	 * @returns true si el CCI ya existe, false en caso contrario
	 */
	private async cciExists(cci: string, excludeId?: number): Promise<boolean> {
		const queryBuilder = this.cuentaRepository
			.createQueryBuilder('cuenta')
			.where('cuenta.cci = :cci', { cci });

		if (excludeId) {
			queryBuilder.andWhere('cuenta.id != :excludeId', { excludeId });
		}

		const existingCuenta = await queryBuilder.getOne();
		return !!existingCuenta;
	}

	/**
	 * Busca una cuenta por su número de cuenta
	 * @param numeroCuenta Número de cuenta
	 * @returns Cuenta encontrada o null
	 */
	async findByNumeroCuenta(numeroCuenta: string): Promise<Cuenta | null> {
		try {
			return await this.cuentaRepository.findOne({
				where: { numeroCuenta },
				relations: ['creator'],
			});
		} catch {
			throw new BadRequestException('Error al buscar la cuenta por número');
		}
	}

	/**
	 * Busca una cuenta por su CCI
	 * @param cci CCI de la cuenta
	 * @returns Cuenta encontrada o null
	 */
	async findByCci(cci: string): Promise<Cuenta | null> {
		try {
			return await this.cuentaRepository.findOne({
				where: { cci },
				relations: ['creator'],
			});
		} catch {
			throw new BadRequestException('Error al buscar la cuenta por CCI');
		}
	}
}
