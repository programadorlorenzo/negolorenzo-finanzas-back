import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsOptional,
	IsEnum,
	IsBoolean,
	IsNumber,
	MinLength,
	MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoCuenta, Moneda } from '../../entities/cuenta.entity';

export class CreateCuentaDto {
	@ApiProperty({
		description: 'Titular de la cuenta',
		example: 'Juan Pérez García',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'El titular debe ser una cadena de texto' })
	@MinLength(2, { message: 'El titular debe tener al menos 2 caracteres' })
	@MaxLength(255, { message: 'El titular no puede tener más de 255 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	titular?: string;

	@ApiProperty({
		description: 'Número de cuenta',
		example: '123-456-789-012',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'El número de cuenta debe ser una cadena de texto' })
	@MaxLength(50, { message: 'El número de cuenta no puede tener más de 50 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	numeroCuenta?: string;

	@ApiProperty({
		description: 'Código de Cuenta Interbancaria (CCI)',
		example: '002-123-001234567890-12',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'El CCI debe ser una cadena de texto' })
	@MaxLength(50, { message: 'El CCI no puede tener más de 50 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	cci?: string;

	@ApiProperty({
		description: 'Moneda de la cuenta',
		enum: Moneda,
		example: Moneda.PEN,
		required: false,
	})
	@IsOptional()
	@IsEnum(Moneda, { message: 'La moneda debe ser un valor válido (PEN, USD, EUR)' })
	moneda?: Moneda;

	@ApiProperty({
		description: 'Tipo de cuenta',
		enum: TipoCuenta,
		example: TipoCuenta.AHORROS,
		required: false,
	})
	@IsOptional()
	@IsEnum(TipoCuenta, {
		message: 'El tipo debe ser un valor válido (AHORROS, CORRIENTE, PLAZO_FIJO, EMPRESA)',
	})
	tipo?: TipoCuenta;

	@ApiProperty({
		description: 'Banco de la cuenta',
		example: 'Banco de Crédito del Perú',
		required: false,
	})
	@IsOptional()
	@IsString({ message: 'El banco debe ser una cadena de texto' })
	@MaxLength(255, { message: 'El banco no puede tener más de 255 caracteres' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : (value as string),
	)
	banco?: string;

	@ApiProperty({
		description: 'Indica si es cuenta de empresa',
		example: false,
		required: false,
	})
	@IsOptional()
	@IsBoolean({ message: 'esEmpresa debe ser un valor booleano' })
	@Transform(({ value }: { value: unknown }) => {
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		return Boolean(value);
	})
	esEmpresa?: boolean;

	@ApiProperty({
		description: 'Indica si es cuenta propia de la empresa',
		example: false,
		required: false,
	})
	@IsOptional()
	@IsBoolean({ message: 'propiaEmpresa debe ser un valor booleano' })
	@Transform(({ value }: { value: unknown }) => {
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		return Boolean(value);
	})
	propiaEmpresa?: boolean;

	@ApiProperty({
		description: 'Estado activo de la cuenta',
		example: true,
		required: false,
	})
	@IsOptional()
	@IsBoolean({ message: 'isActive debe ser un valor booleano' })
	@Transform(({ value }: { value: unknown }) => {
		if (typeof value === 'string') {
			return value.toLowerCase() === 'true';
		}
		return Boolean(value);
	})
	isActive?: boolean;

	@ApiProperty({
		description: 'ID de la sucursal (null = cuenta universal)',
		example: 1,
		required: false,
	})
	@IsOptional()
	@IsNumber({}, { message: 'sucursalId debe ser un número' })
	@Type(() => Number)
	sucursalId?: number;
}
