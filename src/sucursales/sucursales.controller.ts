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
	NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { FilterSucursalesDto } from './dto/filter-sucursales.dto';
import { PaginatedSucursalesResponseDto } from './dto/paginated-sucursales-response.dto';
import { SucursalSimpleDto } from './dto/sucursal-simple.dto';
import { Sucursal } from '../entities/sucursal.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sucursales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sucursales')
export class SucursalesController {
	constructor(private readonly sucursalesService: SucursalesService) {}

	@Post()
	@ApiOperation({ summary: 'Crear nueva sucursal' })
	@ApiResponse({
		status: 201,
		description: 'Sucursal creada exitosamente',
		type: Sucursal,
	})
	@ApiResponse({
		status: 400,
		description: 'Datos de entrada inválidos',
	})
	@ApiResponse({
		status: 409,
		description: 'Ya existe una sucursal con ese código',
	})
	create(@Body() createSucursalDto: CreateSucursalDto) {
		return this.sucursalesService.create(createSucursalDto);
	}

	@Get()
	@ApiOperation({ summary: 'Obtener todas las sucursales con filtros y paginación' })
	@ApiResponse({
		status: 200,
		description: 'Lista de sucursales obtenida exitosamente',
		type: PaginatedSucursalesResponseDto,
	})
	findAll(@Query() filters: FilterSucursalesDto) {
		return this.sucursalesService.findAll(filters);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Obtener sucursal por ID' })
	@ApiResponse({
		status: 200,
		description: 'Sucursal encontrada',
		type: Sucursal,
	})
	@ApiResponse({
		status: 404,
		description: 'Sucursal no encontrada',
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.sucursalesService.findOne(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Actualizar sucursal' })
	@ApiResponse({
		status: 200,
		description: 'Sucursal actualizada exitosamente',
		type: Sucursal,
	})
	@ApiResponse({
		status: 400,
		description: 'Datos de entrada inválidos',
	})
	@ApiResponse({
		status: 404,
		description: 'Sucursal no encontrada',
	})
	@ApiResponse({
		status: 409,
		description: 'Ya existe otra sucursal con ese código',
	})
	update(@Param('id', ParseIntPipe) id: number, @Body() updateSucursalDto: UpdateSucursalDto) {
		return this.sucursalesService.update(id, updateSucursalDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Eliminar sucursal (desactivar)' })
	@ApiResponse({
		status: 200,
		description: 'Sucursal desactivada exitosamente',
	})
	@ApiResponse({
		status: 404,
		description: 'Sucursal no encontrada',
	})
	@ApiResponse({
		status: 400,
		description: 'Error al eliminar la sucursal',
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.sucursalesService.remove(id);
	}

	@Patch(':id/toggle-status')
	@ApiOperation({ summary: 'Cambiar estado activo/inactivo de la sucursal' })
	@ApiResponse({
		status: 200,
		description: 'Estado de la sucursal cambiado exitosamente',
		type: Sucursal,
	})
	@ApiResponse({
		status: 404,
		description: 'Sucursal no encontrada',
	})
	@ApiResponse({
		status: 400,
		description: 'Error al cambiar el estado de la sucursal',
	})
	toggleStatus(@Param('id', ParseIntPipe) id: number) {
		return this.sucursalesService.toggleStatus(id);
	}

	@Get('active/list')
	@ApiOperation({ summary: 'Obtener todas las sucursales activas' })
	@ApiResponse({
		status: 200,
		description: 'Lista de sucursales activas obtenida exitosamente',
		type: [SucursalSimpleDto],
	})
	@ApiResponse({
		status: 400,
		description: 'Error al obtener las sucursales activas',
	})
	findActiveSucursales() {
		return this.sucursalesService.findActiveSucursales();
	}

	@Get('code/:code')
	@ApiOperation({ summary: 'Obtener sucursal por código' })
	@ApiResponse({
		status: 200,
		description: 'Sucursal encontrada',
		type: Sucursal,
	})
	@ApiResponse({
		status: 404,
		description: 'Sucursal no encontrada',
	})
	async findByCode(@Param('code') code: string) {
		const sucursal = await this.sucursalesService.findByCode(code);
		if (!sucursal) {
			throw new NotFoundException(`Sucursal con código '${code}' no encontrada`);
		}
		return sucursal;
	}
}
