import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SeedService } from './seed.service';

@ApiTags('Seeds')
@Controller('seeds')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SeedsController {
	constructor(private readonly seedService: SeedService) {}

	@Post('run')
	@ApiOperation({
		summary: 'Ejecutar seeds de la base de datos',
		description: 'Ejecuta todos los seeds para poblar la base de datos con datos iniciales',
	})
	@ApiResponse({
		status: 200,
		description: 'Seeds ejecutados correctamente',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					example: 'Seeds executed successfully',
				},
				timestamp: {
					type: 'string',
					format: 'date-time',
				},
			},
		},
	})
	@ApiResponse({
		status: 500,
		description: 'Error al ejecutar los seeds',
		schema: {
			type: 'object',
			properties: {
				message: {
					type: 'string',
					example: 'Seeds execution failed',
				},
				error: {
					type: 'string',
				},
			},
		},
	})
	async runSeeds() {
		try {
			await this.seedService.run();
			return {
				message: 'Seeds executed successfully',
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Seeds execution failed: ${errorMessage}`);
		}
	}
}
