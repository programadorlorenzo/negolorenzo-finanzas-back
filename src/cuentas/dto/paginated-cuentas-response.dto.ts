import { ApiProperty } from '@nestjs/swagger';
import { Cuenta } from '../../entities/cuenta.entity';

export class PaginatedCuentasResponseDto {
	@ApiProperty({
		description: 'Lista de cuentas',
		type: [Cuenta],
	})
	data: Cuenta[];

	@ApiProperty({
		description: 'Información de paginación',
		example: {
			total: 50,
			page: 1,
			limit: 10,
			totalPages: 5,
		},
	})
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
