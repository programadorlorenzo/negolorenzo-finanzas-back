import { IsString, IsOptional, IsBoolean, MaxLength, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSucursalDto {
	@ApiProperty({ description: 'Nombre de la sucursal', example: 'Sucursal Centro' })
	@IsNotEmpty({ message: 'El nombre es requerido' })
	@IsString({ message: 'El nombre debe ser una cadena de texto' })
	@MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
	@MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	name: string;

	@ApiProperty({ description: 'Código único de la sucursal', example: 'SC001', required: false })
	@IsOptional()
	@IsString({ message: 'El código debe ser una cadena de texto' })
	@MaxLength(20, { message: 'El código no puede tener más de 20 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim().toUpperCase() : (value as string),
	)
	code?: string;

	@ApiProperty({
		description: 'Dirección de la sucursal',
		example: 'Av. Principal 123',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'La dirección debe ser una cadena de texto' })
	@MaxLength(500, { message: 'La dirección no puede tener más de 500 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	address?: string;

	@ApiProperty({
		description: 'Teléfono de la sucursal',
		example: '+51 999 999 999',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'El teléfono debe ser una cadena de texto' })
	@MaxLength(20, { message: 'El teléfono no puede tener más de 20 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	phone?: string;

	@ApiProperty({
		description: 'Estado activo de la sucursal',
		example: true,
		default: true,
		required: false,
	})
	@IsOptional()
	@IsBoolean({ message: 'El estado debe ser verdadero o falso' })
	isActive?: boolean = true;
}
