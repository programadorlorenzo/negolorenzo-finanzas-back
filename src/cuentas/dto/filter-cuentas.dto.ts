import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoCuenta, Moneda } from '../../entities/cuenta.entity';

export class FilterCuentasDto {
	@ApiProperty({
		description: 'Búsqueda por titular, número de cuenta, CCI o banco',
		example: 'Juan',
		required: false,
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	search?: string;

	@ApiProperty({
		description: 'Filtrar por moneda',
		enum: Moneda,
		required: false,
	})
	@IsOptional()
	@IsEnum(Moneda)
	moneda?: Moneda;

	@ApiProperty({
		description: 'Filtrar por tipo de cuenta',
		enum: TipoCuenta,
		required: false,
	})
	@IsOptional()
	@IsEnum(TipoCuenta)
	tipo?: TipoCuenta;

	@ApiProperty({
		description: 'Filtrar por banco',
		example: 'BCP',
		required: false,
	})
	@IsOptional()
	@IsString()
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	banco?: string;

	@ApiProperty({
		description: 'Filtrar solo cuentas de empresa',
		example: false,
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }: { value: unknown }) => {
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		return Boolean(value);
	})
	esEmpresa?: boolean;

	@ApiProperty({
		description: 'Filtrar por estado activo',
		example: true,
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }: { value: unknown }) => {
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		return Boolean(value);
	})
	isActive?: boolean;

	@ApiProperty({
		description: 'Filtrar por sucursal (null = cuentas universales)',
		example: 1,
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber({}, { message: 'sucursalId debe ser un número' })
	sucursalId?: number;

	@ApiProperty({
		description: 'Número de página',
		example: 1,
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber({}, { message: 'La página debe ser un número' })
	@Min(1, { message: 'La página debe ser mayor a 0' })
	page?: number;

	@ApiProperty({
		description: 'Número de elementos por página',
		example: 10,
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber({}, { message: 'El límite debe ser un número' })
	@Min(1, { message: 'El límite debe ser mayor a 0' })
	@Max(100, { message: 'El límite no puede ser mayor a 100' })
	limit?: number;

	@ApiProperty({
		description: 'Campo por el cual ordenar',
		example: 'createdAt',
		required: false,
	})
	@IsOptional()
	@IsString()
	sortBy?: string;

	@ApiProperty({
		description: 'Dirección del ordenamiento',
		example: 'DESC',
		enum: ['ASC', 'DESC'],
		required: false,
	})
	@IsOptional()
	@IsEnum(['ASC', 'DESC'])
	sortOrder?: 'ASC' | 'DESC';
}
