import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CreatePagoDto, UpdatePagoDto, PagoFilterDto, PagoResponseDto } from './dto/pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Pagos')
@Controller('pagos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PagosController {
	constructor(private readonly pagosService: PagosService) {}

	@Post()
	@ApiOperation({ summary: 'Crear nuevo pago' })
	@ApiResponse({
		status: 201,
		description: 'Pago creado exitosamente',
		type: PagoResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Datos inválidos',
	})
	async create(@Body() createPagoDto: CreatePagoDto) {
		return this.pagosService.create(createPagoDto);
	}

	@Get()
	@ApiOperation({ summary: 'Obtener lista de pagos con filtros y paginación' })
	@ApiResponse({
		status: 200,
		description: 'Lista de pagos obtenida exitosamente',
		schema: {
			type: 'object',
			properties: {
				data: {
					type: 'array',
					items: { $ref: '#/components/schemas/PagoResponseDto' },
				},
				total: { type: 'number' },
				page: { type: 'number' },
				limit: { type: 'number' },
			},
		},
	})
	@ApiQuery({ name: 'search', required: false, description: 'Búsqueda por descripción' })
	@ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado' })
	@ApiQuery({ name: 'moneda', required: false, description: 'Filtrar por moneda' })
	@ApiQuery({ name: 'sucursalId', required: false, description: 'Filtrar por sucursal' })
	@ApiQuery({ name: 'montoMin', required: false, description: 'Monto mínimo' })
	@ApiQuery({ name: 'montoMax', required: false, description: 'Monto máximo' })
	@ApiQuery({ name: 'fechaDesde', required: false, description: 'Fecha desde (YYYY-MM-DD)' })
	@ApiQuery({ name: 'fechaHasta', required: false, description: 'Fecha hasta (YYYY-MM-DD)' })
	@ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
	@ApiQuery({ name: 'limit', required: false, description: 'Elementos por página', example: 10 })
	async findAll(@Query() filters: PagoFilterDto) {
		return this.pagosService.findAll(filters);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Obtener pago por ID' })
	@ApiResponse({
		status: 200,
		description: 'Pago encontrado',
		type: PagoResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Pago no encontrado',
	})
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.pagosService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Actualizar pago' })
	@ApiResponse({
		status: 200,
		description: 'Pago actualizado exitosamente',
		type: PagoResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Pago no encontrado',
	})
	@ApiResponse({
		status: 400,
		description: 'Datos inválidos',
	})
	async update(@Param('id', ParseIntPipe) id: number, @Body() updatePagoDto: UpdatePagoDto) {
		return this.pagosService.update(id, updatePagoDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Eliminar pago' })
	@ApiResponse({
		status: 200,
		description: 'Pago eliminado exitosamente',
	})
	@ApiResponse({
		status: 404,
		description: 'Pago no encontrado',
	})
	async remove(@Param('id', ParseIntPipe) id: number) {
		await this.pagosService.remove(id);
		return { message: 'Pago eliminado exitosamente' };
	}
}
