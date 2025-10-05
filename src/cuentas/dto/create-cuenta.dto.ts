import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoCuenta } from '../../entities/cuenta.entity';

export class CreateCuentaDto {
	@ApiProperty({ description: 'Titular de la cuenta', example: 'Walter Lorenzo', required: false })
	@IsOptional()
	@IsString()
	titular?: string;

	@ApiProperty({
		description: 'Número de cuenta bancaria',
		example: '1234567890123456',
		required: false,
	})
	@IsOptional()
	@IsString()
	numeroCuenta?: string;

	@ApiProperty({
		description: 'Código de cuenta interbancario (CCI)',
		example: '002-123-001234567890-12',
		required: false,
	})
	@IsOptional()
	@IsString()
	cci?: string;

	@ApiProperty({ description: 'Moneda de la cuenta', example: 'PEN', required: false })
	@IsOptional()
	@IsString()
	moneda?: string;

	@ApiProperty({
		description: 'Tipo de cuenta bancaria',
		enum: TipoCuenta,
		example: TipoCuenta.CORRIENTE,
		required: false,
	})
	@IsOptional()
	@IsEnum(TipoCuenta)
	tipo?: TipoCuenta;

	@ApiProperty({ description: 'ID de la sucursal', example: 1, required: false })
	@IsOptional()
	sucursalId?: number;
}
