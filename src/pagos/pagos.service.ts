import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import { Pago, PagoDocument, File, Sucursal } from '../entities';
import { CreatePagoDto, UpdatePagoDto, PagoFilterDto, PagoResponseDto } from './dto/pago.dto';
import type { AuthenticatedUser } from '../common/interfaces/user.interface';

@Injectable()
export class PagosService {
	constructor(
		@InjectRepository(Pago)
		private pagoRepository: Repository<Pago>,
		@InjectRepository(PagoDocument)
		private pagoDocumentRepository: Repository<PagoDocument>,
		@InjectRepository(File)
		private fileRepository: Repository<File>,
		@InjectRepository(Sucursal)
		private sucursalRepository: Repository<Sucursal>,
	) {}

	async create(createPagoDto: CreatePagoDto): Promise<PagoResponseDto> {
		// Validar que el archivo voucher existe si se proporciona
		if (createPagoDto.voucherFileId) {
			const voucherFile = await this.fileRepository.findOne({
				where: { id: createPagoDto.voucherFileId },
			});
			if (!voucherFile) {
				throw new BadRequestException('Archivo voucher no encontrado');
			}
		}

		// Validar que los archivos de documentos existen si se proporcionan
		if (createPagoDto.documentFileIds && createPagoDto.documentFileIds.length > 0) {
			const documentFiles = await this.fileRepository.find({
				where: { id: In(createPagoDto.documentFileIds) },
			});
			if (documentFiles.length !== createPagoDto.documentFileIds.length) {
				throw new BadRequestException('Uno o más archivos de documentos no encontrados');
			}
		}

		// Crear el pago
		const pago = this.pagoRepository.create({
			descripcion: createPagoDto.descripcion,
			justificacion: createPagoDto.justificacion,
			coordinadoCon: createPagoDto.coordinadoCon,
			total: createPagoDto.total,
			moneda: createPagoDto.moneda,
			sucursalId: createPagoDto.sucursalId,
			cuentaDestinoId: createPagoDto.cuentaDestinoId,
			cuentaPropiaEmpresaId: createPagoDto.cuentaPropiaEmpresaId,
			voucherFileId: createPagoDto.voucherFileId,
		});

		const savedPago = await this.pagoRepository.save(pago);

		// Crear relaciones con documentos si existen
		if (createPagoDto.documentFileIds && createPagoDto.documentFileIds.length > 0) {
			const pagoDocuments = createPagoDto.documentFileIds.map(fileId =>
				this.pagoDocumentRepository.create({
					pagoId: savedPago.id,
					fileId: fileId,
				}),
			);
			await this.pagoDocumentRepository.save(pagoDocuments);
		}

		return this.findOne(savedPago.id);
	}

	async findAll(
		filters: PagoFilterDto,
		user: AuthenticatedUser,
	): Promise<{
		data: PagoResponseDto[];
		total: number;
		page: number;
		limit: number;
	}> {
		const { page = 1, limit = 10, ...filterOptions } = filters;
		const skip = (page - 1) * limit;

		const queryBuilder = this.createQueryBuilder(filterOptions);

		// Aplicar filtrado por sucursales del usuario
		await this.applySucursalFilter(queryBuilder, user);

		const [pagos, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

		const data = pagos.map(pago => this.transformToResponse(pago));

		return {
			data,
			total,
			page,
			limit,
		};
	}

	async findOne(id: number): Promise<PagoResponseDto> {
		const pago = await this.pagoRepository.findOne({
			where: { id },
			relations: [
				'sucursal',
				'cuentaDestino',
				'cuentaPropiaEmpresa',
				'voucherFile',
				'documentFiles',
				'documentFiles.file',
			],
		});

		if (!pago) {
			throw new NotFoundException('Pago no encontrado');
		}

		return this.transformToResponse(pago);
	}

	async update(id: number, updatePagoDto: UpdatePagoDto): Promise<PagoResponseDto> {
		const pago = await this.pagoRepository.findOne({
			where: { id },
			relations: ['documentFiles'],
		});

		if (!pago) {
			throw new NotFoundException('Pago no encontrado');
		}

		// Validar archivo voucher si se proporciona
		if (updatePagoDto.voucherFileId) {
			const voucherFile = await this.fileRepository.findOne({
				where: { id: updatePagoDto.voucherFileId },
			});
			if (!voucherFile) {
				throw new BadRequestException('Archivo voucher no encontrado');
			}
		}

		// Actualizar campos básicos
		Object.assign(pago, {
			descripcion: updatePagoDto.descripcion ?? pago.descripcion,
			justificacion: updatePagoDto.justificacion ?? pago.justificacion,
			coordinadoCon: updatePagoDto.coordinadoCon ?? pago.coordinadoCon,
			total: updatePagoDto.total ?? pago.total,
			moneda: updatePagoDto.moneda ?? pago.moneda,
			status: updatePagoDto.status ?? pago.status,
			sucursalId: updatePagoDto.sucursalId ?? pago.sucursalId,
			cuentaDestinoId: updatePagoDto.cuentaDestinoId ?? pago.cuentaDestinoId,
			cuentaPropiaEmpresaId: updatePagoDto.cuentaPropiaEmpresaId ?? pago.cuentaPropiaEmpresaId,
			voucherFileId: updatePagoDto.voucherFileId ?? pago.voucherFileId,
		});

		await this.pagoRepository.save(pago);

		// Actualizar documentos si se proporcionan
		if (updatePagoDto.documentFileIds !== undefined) {
			// Eliminar documentos existentes
			await this.pagoDocumentRepository.delete({ pagoId: id });

			// Crear nuevos documentos
			if (updatePagoDto.documentFileIds.length > 0) {
				const documentFiles = await this.fileRepository.find({
					where: { id: In(updatePagoDto.documentFileIds) },
				});
				if (documentFiles.length !== updatePagoDto.documentFileIds.length) {
					throw new BadRequestException('Uno o más archivos de documentos no encontrados');
				}

				const pagoDocuments = updatePagoDto.documentFileIds.map(fileId =>
					this.pagoDocumentRepository.create({
						pagoId: id,
						fileId: fileId,
					}),
				);
				await this.pagoDocumentRepository.save(pagoDocuments);
			}
		}

		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const pago = await this.pagoRepository.findOne({ where: { id } });
		if (!pago) {
			throw new NotFoundException('Pago no encontrado');
		}

		// Eliminar documentos relacionados
		await this.pagoDocumentRepository.delete({ pagoId: id });

		// Eliminar el pago
		await this.pagoRepository.remove(pago);
	}

	private createQueryBuilder(
		filters: Omit<PagoFilterDto, 'page' | 'limit'>,
	): SelectQueryBuilder<Pago> {
		const queryBuilder = this.pagoRepository
			.createQueryBuilder('pago')
			.leftJoinAndSelect('pago.sucursal', 'sucursal')
			.leftJoinAndSelect('pago.cuentaDestino', 'cuentaDestino')
			.leftJoinAndSelect('pago.cuentaPropiaEmpresa', 'cuentaPropiaEmpresa')
			.leftJoinAndSelect('pago.voucherFile', 'voucherFile')
			.leftJoinAndSelect('pago.documentFiles', 'documentFiles')
			.leftJoinAndSelect('documentFiles.file', 'file')
			.orderBy('pago.createdAt', 'DESC');

		if (filters.search) {
			queryBuilder.andWhere(
				'(pago.descripcion ILIKE :search OR pago.justificacion ILIKE :search OR pago.coordinadoCon ILIKE :search)',
				{ search: `%${filters.search}%` },
			);
		}

		if (filters.status) {
			queryBuilder.andWhere('pago.status = :status', { status: filters.status });
		}

		if (filters.moneda) {
			queryBuilder.andWhere('pago.moneda = :moneda', { moneda: filters.moneda });
		}

		if (filters.sucursalId) {
			queryBuilder.andWhere('pago.sucursalId = :sucursalId', { sucursalId: filters.sucursalId });
		}

		if (filters.cuentaDestinoId) {
			queryBuilder.andWhere('pago.cuentaDestinoId = :cuentaDestinoId', {
				cuentaDestinoId: filters.cuentaDestinoId,
			});
		}

		if (filters.cuentaPropiaEmpresaId) {
			queryBuilder.andWhere('pago.cuentaPropiaEmpresaId = :cuentaPropiaEmpresaId', {
				cuentaPropiaEmpresaId: filters.cuentaPropiaEmpresaId,
			});
		}

		if (filters.montoMin !== undefined) {
			queryBuilder.andWhere('pago.total >= :montoMin', { montoMin: filters.montoMin });
		}

		if (filters.montoMax !== undefined) {
			queryBuilder.andWhere('pago.total <= :montoMax', { montoMax: filters.montoMax });
		}

		if (filters.fechaDesde) {
			queryBuilder.andWhere('pago.createdAt >= :fechaDesde', { fechaDesde: filters.fechaDesde });
		}

		if (filters.fechaHasta) {
			queryBuilder.andWhere('pago.createdAt <= :fechaHasta', { fechaHasta: filters.fechaHasta });
		}

		return queryBuilder;
	}

	private transformToResponse(pago: Pago): PagoResponseDto {
		return {
			id: pago.id,
			descripcion: pago.descripcion,
			justificacion: pago.justificacion,
			coordinadoCon: pago.coordinadoCon,
			total: pago.total,
			moneda: pago.moneda,
			status: pago.status,
			sucursalId: pago.sucursalId,
			sucursal: pago.sucursal
				? {
						id: pago.sucursal.id,
						name: pago.sucursal.name,
						code: pago.sucursal.code,
					}
				: undefined,
			cuentaDestinoId: pago.cuentaDestinoId,
			cuentaDestino: pago.cuentaDestino
				? {
						id: pago.cuentaDestino.id,
						nombre: pago.cuentaDestino.titular,
						numero: pago.cuentaDestino.numeroCuenta,
						tipo: pago.cuentaDestino.tipo,
					}
				: undefined,
			cuentaPropiaEmpresaId: pago.cuentaPropiaEmpresaId,
			cuentaPropiaEmpresa: pago.cuentaPropiaEmpresa
				? {
						id: pago.cuentaPropiaEmpresa.id,
						nombre: pago.cuentaPropiaEmpresa.titular,
						numero: pago.cuentaPropiaEmpresa.numeroCuenta,
						tipo: pago.cuentaPropiaEmpresa.tipo,
					}
				: undefined,
			voucherFile: pago.voucherFile
				? {
						id: pago.voucherFile.id,
						originalName: pago.voucherFile.originalName,
						filename: pago.voucherFile.filename,
						path: pago.voucherFile.path,
						mimetype: pago.voucherFile.mimetype,
						size: pago.voucherFile.size,
						category: pago.voucherFile.category,
					}
				: undefined,
			documentFiles:
				pago.documentFiles?.map(doc => ({
					id: doc.file.id,
					originalName: doc.file.originalName,
					filename: doc.file.filename,
					path: doc.file.path,
					mimetype: doc.file.mimetype,
					size: doc.file.size,
					category: doc.file.category,
				})) || [],
			createdAt: pago.createdAt,
			updatedAt: pago.updatedAt,
		};
	}

	/**
	 * Aplica filtros de sucursal basados en los permisos del usuario
	 */
	private async applySucursalFilter(
		queryBuilder: SelectQueryBuilder<Pago>,
		user: AuthenticatedUser,
	): Promise<void> {
		// Si el usuario es superadmin o admin, puede ver todos los pagos
		if (user.role === 'SuperAdmin' || user.role === 'Admin') {
			return;
		}

		// Obtener IDs de sucursales del usuario
		const sucursalesDelUsuario = await this.sucursalRepository.find({
			where: { name: In(user.sucursales) },
			select: ['id'],
		});

		const sucursalIds = sucursalesDelUsuario.map(s => s.id);

		if (sucursalIds.length === 0) {
			// Si el usuario no tiene sucursales asignadas, no puede ver ningún pago
			queryBuilder.andWhere('1 = 0'); // Condición que nunca es verdadera
		} else {
			// Filtrar por sucursales del usuario, incluyendo pagos sin sucursal
			queryBuilder.andWhere('(pago.sucursalId IN (:...sucursalIds) OR pago.sucursalId IS NULL)', {
				sucursalIds,
			});
		}
	}
}
