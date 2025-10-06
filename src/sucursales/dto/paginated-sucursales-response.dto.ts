import { ApiProperty } from '@nestjs/swagger';
import { Sucursal } from '../../entities/sucursal.entity';

export class PaginatedSucursalesResponseDto {
	@ApiProperty({ type: [Sucursal], description: 'Lista de sucursales' })
	data: Sucursal[];

	@ApiProperty({ description: 'Número total de sucursales', example: 100 })
	total: number;

	@ApiProperty({ description: 'Página actual', example: 1 })
	page: number;

	@ApiProperty({ description: 'Elementos por página', example: 10 })
	limit: number;

	@ApiProperty({ description: 'Número total de páginas', example: 10 })
	totalPages: number;
}