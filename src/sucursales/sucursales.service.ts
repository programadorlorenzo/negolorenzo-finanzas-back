import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
		const sucursal = this.sucursalRepository.create(createSucursalDto);
		return await this.sucursalRepository.save(sucursal);
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
		const sucursal = await this.findOne(id);

		Object.assign(sucursal, updateSucursalDto);

		return await this.sucursalRepository.save(sucursal);
	}

	async remove(id: number): Promise<void> {
		const sucursal = await this.findOne(id);
		await this.sucursalRepository.remove(sucursal);
	}

	async toggleStatus(id: number): Promise<Sucursal> {
		const sucursal = await this.findOne(id);
		sucursal.isActive = !sucursal.isActive;
		return await this.sucursalRepository.save(sucursal);
	}
}
