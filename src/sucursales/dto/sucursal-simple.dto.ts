import { ApiProperty } from '@nestjs/swagger';

export class SucursalSimpleDto {
	@ApiProperty({
		description: 'ID único de la sucursal',
		example: 1,
	})
	id: number;

	@ApiProperty({
		description: 'Nombre de la sucursal',
		example: 'Sucursal Centro',
	})
	name: string;

	@ApiProperty({
		description: 'Código único de la sucursal',
		example: 'SUC-001',
		required: false,
	})
	code?: string;

	@ApiProperty({
		description: 'Estado activo/inactivo de la sucursal',
		example: true,
	})
	isActive: boolean;
}
