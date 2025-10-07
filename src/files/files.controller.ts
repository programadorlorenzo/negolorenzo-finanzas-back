import {
	Controller,
	Post,
	Get,
	Delete,
	Param,
	Query,
	UseInterceptors,
	UploadedFile,
	ParseIntPipe,
	Res,
	NotFoundException,
	UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FilesService } from './files.service';
import { UploadFileDto, FileResponseDto } from './file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Files')
@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('upload')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Subir archivo' })
	@ApiResponse({
		status: 201,
		description: 'Archivo subido exitosamente',
		type: FileResponseDto,
	})
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const originalName = typeof file.originalname === 'string' ? file.originalname : '';
					const extension = originalName ? extname(originalName) : '';
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					const uniqueName = `${uuidv4()}${extension}`;
					cb(null, uniqueName);
				},
			}),
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB
			},
			fileFilter: (req, file, cb) => {
				// Permitir imágenes, documentos y PDFs
				const allowedMimes = [
					'image/jpeg',
					'image/png',
					'image/gif',
					'image/webp',
					'application/pdf',
					'application/msword',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					'application/vnd.ms-excel',
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				];

				if (allowedMimes.includes(file.mimetype)) {
					cb(null, true);
				} else {
					cb(new Error('Tipo de archivo no permitido'), false);
				}
			},
		}),
	)
	async uploadFile(
		@UploadedFile() file: Express.Multer.File,
		@Query() uploadFileDto: UploadFileDto,
	) {
		return this.filesService.uploadFile(file, uploadFileDto.category);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Obtener lista de archivos' })
	@ApiResponse({
		status: 200,
		description: 'Lista de archivos',
		type: [FileResponseDto],
	})
	async getFilesList(@Query('category') category?: string) {
		return this.filesService.getFilesList(category);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Descargar archivo por ID' })
	@ApiResponse({
		status: 200,
		description: 'Archivo encontrado',
	})
	@ApiResponse({
		status: 404,
		description: 'Archivo no encontrado',
	})
	async downloadFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
		const file = await this.filesService.getFile(id);

		if (!file) {
			throw new NotFoundException('Archivo no encontrado');
		}

		return res.sendFile(file.path, { root: '.' });
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Eliminar archivo' })
	@ApiResponse({
		status: 200,
		description: 'Archivo eliminado exitosamente',
	})
	@ApiResponse({
		status: 404,
		description: 'Archivo no encontrado',
	})
	async deleteFile(@Param('id', ParseIntPipe) id: number) {
		await this.filesService.deleteFile(id);
		return { message: 'Archivo eliminado exitosamente' };
	}
}
