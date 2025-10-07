import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UploadFileDto {
	@ApiProperty({
		description: 'Categoría del archivo',
		example: 'voucher',
		required: false,
	})
	@IsOptional()
	@IsString()
	category?: string;
}

export class FileResponseDto {
	@ApiProperty({ description: 'ID del archivo' })
	id: number;

	@ApiProperty({ description: 'Nombre original del archivo' })
	originalName: string;

	@ApiProperty({ description: 'Ruta del archivo' })
	path: string;

	@ApiProperty({ description: 'URL pública del archivo' })
	url: string;

	@ApiProperty({ description: 'Tipo MIME' })
	mimetype: string;

	@ApiProperty({ description: 'Tamaño en bytes' })
	size: number;

	@ApiProperty({ description: 'Categoría del archivo' })
	category?: string;
}
