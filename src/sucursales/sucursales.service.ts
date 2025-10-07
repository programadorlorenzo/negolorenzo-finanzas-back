import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Sucursal } from '../entities/sucursal.entity';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { FilterSucursalesDto } from './dto/filter-sucursales.dto';

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

@Injectable()
export class SucursalesService {
	constructor(
		@InjectRepository(Sucursal)
		private readonly sucursalRepository: Repository<Sucursal>,
	) {}

	async create(createSucursalDto: CreateSucursalDto): Promise<Sucursal> {
		try {
			// Verificar si ya existe una sucursal con el mismo código (si se proporciona)
			if (createSucursalDto.code && (await this.codeExists(createSucursalDto.code))) {
				throw new ConflictException(
					`Ya existe una sucursal con el código '${createSucursalDto.code}'`,
				);
			}

			const sucursal = this.sucursalRepository.create({
				...createSucursalDto,
				isActive: createSucursalDto.isActive ?? true,
			});

			return await this.sucursalRepository.save(sucursal);
		} catch (error) {
			if (error instanceof ConflictException) {
				throw error;
			}

			if (error instanceof QueryFailedError) {
				// Manejar errores de base de datos específicos
				if (error.message.includes('unique constraint')) {
					throw new ConflictException('Ya existe una sucursal con ese código');
				}
			}

			throw new BadRequestException('Error al crear la sucursal');
		}
	}

	async findAll(filters: FilterSucursalesDto): Promise<PaginatedResult<Sucursal>> {
		const { page = 1, limit = 10, name, isActive, sortBy = 'name', sortOrder = 'ASC' } = filters;

		const queryBuilder = this.sucursalRepository.createQueryBuilder('sucursal');

		// Aplicar filtros
		if (name) {
			queryBuilder.andWhere('LOWER(sucursal.name) LIKE LOWER(:name)', {
				name: `%${name}%`,
			});
		}

		if (isActive !== undefined) {
			queryBuilder.andWhere('sucursal.isActive = :isActive', { isActive });
		}

		// Aplicar ordenamiento
		const validSortFields = ['name', 'code', 'createdAt', 'updatedAt'];
		const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
		queryBuilder.orderBy(`sucursal.${sortField}`, sortOrder);

		// Aplicar paginación
		const skip = (page - 1) * limit;
		queryBuilder.skip(skip).take(limit);

		// Ejecutar consulta
		const [data, total] = await queryBuilder.getManyAndCount();

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async findOne(id: number): Promise<Sucursal> {
		const sucursal = await this.sucursalRepository.findOne({
			where: { id },
		});

		if (!sucursal) {
			throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
		}

		return sucursal;
	}

	async update(id: number, updateSucursalDto: UpdateSucursalDto): Promise<Sucursal> {
		try {
			// Verificar si la sucursal existe
			const existingSucursal = await this.sucursalRepository.findOne({
				where: { id },
			});

			if (!existingSucursal) {
				throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
			}

			// Verificar si el código ya existe en otra sucursal
			if (
				updateSucursalDto.code &&
				updateSucursalDto.code !== existingSucursal.code &&
				(await this.codeExists(updateSucursalDto.code, id))
			) {
				throw new ConflictException(
					`Ya existe otra sucursal con el código '${updateSucursalDto.code}'`,
				);
			}

			// Actualizar la sucursal
			await this.sucursalRepository.update(id, updateSucursalDto);

			// Retornar la sucursal actualizada
			const updatedSucursal = await this.sucursalRepository.findOne({
				where: { id },
			});

			if (!updatedSucursal) {
				throw new NotFoundException(`Sucursal con ID ${id} no encontrada después de actualizar`);
			}

			return updatedSucursal;
		} catch (error) {
			if (error instanceof NotFoundException || error instanceof ConflictException) {
				throw error;
			}

			if (error instanceof QueryFailedError) {
				// Manejar errores de base de datos específicos
				if (error.message.includes('unique constraint')) {
					throw new ConflictException('Ya existe una sucursal con ese código');
				}
			}

			throw new BadRequestException('Error al actualizar la sucursal');
		}
	}

	async remove(id: number): Promise<void> {
		try {
			const sucursal = await this.sucursalRepository.findOne({
				where: { id },
			});

			if (!sucursal) {
				throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
			}

			// Soft delete: marcar como inactiva en lugar de eliminar físicamente
			await this.sucursalRepository.update(id, { isActive: false });
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new BadRequestException('Error al eliminar la sucursal');
		}
	}

	async toggleStatus(id: number): Promise<Sucursal> {
		try {
			const sucursal = await this.sucursalRepository.findOne({
				where: { id },
			});

			if (!sucursal) {
				throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
			}

			// Cambiar el estado activo/inactivo
			await this.sucursalRepository.update(id, {
				isActive: !sucursal.isActive,
			});

			// Retornar la sucursal actualizada
			const updatedSucursal = await this.sucursalRepository.findOne({
				where: { id },
			});

			if (!updatedSucursal) {
				throw new NotFoundException(`Sucursal con ID ${id} no encontrada después de actualizar`);
			}

			return updatedSucursal;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}

			throw new BadRequestException('Error al cambiar el estado de la sucursal');
		}
	}

	async findActiveSucursales(): Promise<Sucursal[]> {
		try {
			return await this.sucursalRepository.find({
				where: { isActive: true },
				order: { name: 'ASC' },
			});
		} catch {
			throw new BadRequestException('Error al obtener las sucursales activas');
		}
	}

	/**
	 * Verifica si un código de sucursal ya existe
	 * @param code Código a verificar
	 * @param excludeId ID de sucursal a excluir de la verificación (opcional)
	 * @returns true si el código ya existe, false en caso contrario
	 */
	private async codeExists(code: string, excludeId?: number): Promise<boolean> {
		const queryBuilder = this.sucursalRepository
			.createQueryBuilder('sucursal')
			.where('sucursal.code = :code', { code });

		if (excludeId) {
			queryBuilder.andWhere('sucursal.id != :excludeId', { excludeId });
		}

		const existingSucursal = await queryBuilder.getOne();
		return !!existingSucursal;
	}

	/**
	 * Busca una sucursal por su código
	 * @param code Código de la sucursal
	 * @returns Sucursal encontrada o null
	 */
	async findByCode(code: string): Promise<Sucursal | null> {
		try {
			return await this.sucursalRepository.findOne({
				where: { code },
			});
		} catch {
			throw new BadRequestException('Error al buscar la sucursal por código');
		}
	}
}
