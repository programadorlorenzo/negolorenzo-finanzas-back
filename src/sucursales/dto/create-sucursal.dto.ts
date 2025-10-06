import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSucursalDto {
	@ApiProperty({ description: 'Nombre de la sucursal', example: 'Sucursal Centro' })
	@IsString()
	@MaxLength(100)
	name: string;

	@ApiProperty({ description: 'Código único de la sucursal', example: 'SC001', required: false })
	@IsOptional()
	@IsString()
	@MaxLength(20)
	code?: string;

	@ApiProperty({
		description: 'Dirección de la sucursal',
		example: 'Av. Principal 123',
		required: false,
	})
	@IsOptional()
	@IsString()
	address?: string;

	@ApiProperty({
		description: 'Teléfono de la sucursal',
		example: '+51 999 999 999',
		required: false,
	})
	@IsOptional()
	@IsString()
	@MaxLength(20)
	phone?: string;

	@ApiProperty({ description: 'Estado activo de la sucursal', example: true, required: false })
	@IsOptional()
	@IsBoolean()
	isActive?: boolean;
}
