import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterSucursalesDto {
	@ApiProperty({ description: 'Página actual', example: 1, required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	page?: number = 1;

	@ApiProperty({ description: 'Elementos por página', example: 10, required: false })
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	limit?: number = 10;

	@ApiProperty({ description: 'Buscar por nombre', example: 'Centro', required: false })
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({ description: 'Filtrar por estado activo', example: true, required: false })
	@IsOptional()
	@Transform(({ value }) => {
		if (value === 'true') return true;
		if (value === 'false') return false;
		return value as boolean;
	})
	@IsBoolean()
	isActive?: boolean;

	@ApiProperty({ description: 'Campo para ordenar', example: 'name', required: false })
	@IsOptional()
	@IsString()
	sortBy?: string = 'name';

	@ApiProperty({ description: 'Dirección del ordenamiento', example: 'ASC', required: false })
	@IsOptional()
	@IsString()
	sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
