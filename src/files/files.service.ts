import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './file.entity';
import { FileResponseDto } from './file.dto';
import * as fs from 'fs';

@Injectable()
export class FilesService {
	constructor(
		@InjectRepository(File)
		private readonly fileRepository: Repository<File>,
	) {}

	async uploadFile(
		file: Express.Multer.File,
		category?: string,
		userId?: number,
	): Promise<FileResponseDto> {
		try {
			// Validar archivo
			if (!file) {
				throw new BadRequestException('No se ha proporcionado ningún archivo');
			}

			// Crear registro en base de datos
			const fileEntity = this.fileRepository.create({
				originalName: file.originalname,
				filename: file.filename,
				path: file.path,
				mimetype: file.mimetype,
				size: file.size,
				category,
				uploadedBy: userId,
			});

			const savedFile = await this.fileRepository.save(fileEntity);

			// Retornar respuesta
			return {
				id: savedFile.id,
				originalName: savedFile.originalName,
				path: savedFile.path,
				url: `/api/files/${savedFile.id}`,
				mimetype: savedFile.mimetype,
				size: savedFile.size,
				category: savedFile.category,
			};
		} catch (error) {
			// Si hay error, eliminar el archivo físico
			if (file?.path && fs.existsSync(file.path)) {
				fs.unlinkSync(file.path);
			}
			throw error;
		}
	}

	async getFile(id: number): Promise<File> {
		const file = await this.fileRepository.findOne({ where: { id } });
		if (!file) {
			throw new NotFoundException('Archivo no encontrado');
		}
		return file;
	}

	async deleteFile(id: number): Promise<void> {
		const file = await this.getFile(id);

		// Eliminar archivo físico
		if (fs.existsSync(file.path)) {
			fs.unlinkSync(file.path);
		}

		// Eliminar registro de base de datos
		await this.fileRepository.delete(id);
	}

	async getFilesList(category?: string): Promise<FileResponseDto[]> {
		const queryBuilder = this.fileRepository.createQueryBuilder('file');

		if (category) {
			queryBuilder.where('file.category = :category', { category });
		}

		queryBuilder.orderBy('file.createdAt', 'DESC');

		const files = await queryBuilder.getMany();

		return files.map(file => ({
			id: file.id,
			originalName: file.originalName,
			path: file.path,
			url: `/api/files/${file.id}`,
			mimetype: file.mimetype,
			size: file.size,
			category: file.category,
		}));
	}
}
