import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsNumber,
	IsEnum,
	IsPositive,
	IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { StatusPago, Moneda } from '../../entities';

export class CreatePagoDto {
	@ApiProperty({ description: 'Descripción del pago' })
	@IsNotEmpty()
	@IsString()
	descripcion: string;

	@ApiPropertyOptional({ description: 'Justificación del pago' })
	@IsOptional()
	@IsString()
	justificacion?: string;

	@ApiPropertyOptional({ description: 'Persona con quien se coordinó' })
	@IsOptional()
	@IsString()
	coordinadoCon?: string;

	@ApiProperty({ description: 'Monto total del pago' })
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	@Transform(({ value }) => parseFloat(String(value)))
	total: number;

	@ApiProperty({ enum: Moneda, description: 'Moneda del pago' })
	@IsEnum(Moneda)
	moneda: Moneda;

	@ApiPropertyOptional({ description: 'ID de la sucursal (opcional)' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	sucursalId?: number;

	@ApiPropertyOptional({ description: 'ID de la cuenta destino (opcional)' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	cuentaDestinoId?: number;

	@ApiPropertyOptional({ description: 'ID de la cuenta propia empresa (opcional)' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	cuentaPropiaEmpresaId?: number;

	@ApiPropertyOptional({ description: 'ID del archivo voucher' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	voucherFileId?: number;

	@ApiPropertyOptional({
		description: 'IDs de archivos de documentos',
		type: [Number],
	})
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	@Type(() => Number)
	documentFileIds?: number[];
}

export class UpdatePagoDto {
	@ApiPropertyOptional({ description: 'Descripción del pago' })
	@IsOptional()
	@IsString()
	descripcion?: string;

	@ApiPropertyOptional({ description: 'Justificación del pago' })
	@IsOptional()
	@IsString()
	justificacion?: string;

	@ApiPropertyOptional({ description: 'Persona con quien se coordinó' })
	@IsOptional()
	@IsString()
	coordinadoCon?: string;

	@ApiPropertyOptional({ description: 'Monto total del pago' })
	@IsOptional()
	@IsNumber()
	@IsPositive()
	@Transform(({ value }) => parseFloat(String(value)))
	total?: number;

	@ApiPropertyOptional({ enum: Moneda, description: 'Moneda del pago' })
	@IsOptional()
	@IsEnum(Moneda)
	moneda?: Moneda;

	// Campo status removido - usar endpoint específico /status para cambiar estado

	@ApiPropertyOptional({ description: 'ID de la sucursal (opcional)' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	sucursalId?: number;

	@ApiPropertyOptional({ description: 'ID de la cuenta destino (opcional)' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	cuentaDestinoId?: number;

	@ApiPropertyOptional({ description: 'ID de la cuenta propia empresa (opcional)' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	cuentaPropiaEmpresaId?: number;

	@ApiPropertyOptional({ description: 'ID del archivo voucher' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	voucherFileId?: number;

	@ApiPropertyOptional({
		description: 'IDs de archivos de documentos',
		type: [Number],
	})
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	@Type(() => Number)
	documentFileIds?: number[];
}

// DTO específico para cambio de estado (solo Admin/SuperAdmin)
export class ChangeStatusPagoDto {
	@ApiProperty({ enum: StatusPago, description: 'Nuevo estado del pago' })
	@IsEnum(StatusPago)
	status: StatusPago;
}

export class PagoFilterDto {
	@ApiPropertyOptional({ description: 'Búsqueda por descripción' })
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({ enum: StatusPago, description: 'Filtrar por estado' })
	@IsOptional()
	@IsEnum(StatusPago)
	status?: StatusPago;

	@ApiPropertyOptional({ enum: Moneda, description: 'Filtrar por moneda' })
	@IsOptional()
	@IsEnum(Moneda)
	moneda?: Moneda;

	@ApiPropertyOptional({ description: 'Filtrar por sucursal' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	sucursalId?: number;

	@ApiPropertyOptional({ description: 'Filtrar por cuenta destino' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	cuentaDestinoId?: number;

	@ApiPropertyOptional({ description: 'Filtrar por cuenta propia empresa' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	cuentaPropiaEmpresaId?: number;

	@ApiPropertyOptional({ description: 'Monto mínimo' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	montoMin?: number;

	@ApiPropertyOptional({ description: 'Monto máximo' })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	montoMax?: number;

	@ApiPropertyOptional({ description: 'Fecha desde (YYYY-MM-DD)' })
	@IsOptional()
	@IsString()
	fechaDesde?: string;

	@ApiPropertyOptional({ description: 'Fecha hasta (YYYY-MM-DD)' })
	@IsOptional()
	@IsString()
	fechaHasta?: string;

	@ApiPropertyOptional({ description: 'Página', default: 1 })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	page?: number = 1;

	@ApiPropertyOptional({ description: 'Elementos por página', default: 10 })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	limit?: number = 10;
}

export class FileResponseDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	originalName: string;

	@ApiProperty()
	filename: string;

	@ApiProperty()
	path: string;

	@ApiProperty()
	mimetype: string;

	@ApiProperty()
	size: number;

	@ApiPropertyOptional()
	category?: string;
}

export class PagoResponseDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	descripcion: string;

	@ApiPropertyOptional()
	justificacion?: string;

	@ApiPropertyOptional()
	coordinadoCon?: string;

	@ApiProperty()
	total: number;

	@ApiProperty({ enum: Moneda })
	moneda: Moneda;

	@ApiProperty({ enum: StatusPago })
	status: StatusPago;

	@ApiPropertyOptional()
	sucursalId?: number;

	@ApiPropertyOptional()
	sucursal?: {
		id: number;
		name: string;
		code?: string;
	};

	@ApiPropertyOptional()
	cuentaDestinoId?: number;

	@ApiPropertyOptional()
	cuentaDestino?: {
		id: number;
		nombre: string;
		numero: string;
		tipo: string;
	};

	@ApiPropertyOptional()
	cuentaPropiaEmpresaId?: number;

	@ApiPropertyOptional()
	cuentaPropiaEmpresa?: {
		id: number;
		nombre: string;
		numero: string;
		tipo: string;
	};

	@ApiPropertyOptional({ type: FileResponseDto })
	voucherFile?: FileResponseDto;

	@ApiPropertyOptional({ type: [FileResponseDto] })
	documentFiles?: FileResponseDto[];

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;
}
