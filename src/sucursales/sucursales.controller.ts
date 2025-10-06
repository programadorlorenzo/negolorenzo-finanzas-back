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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SucursalesService } from './sucursales.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { FilterSucursalesDto } from './dto/filter-sucursales.dto';
import { PaginatedSucursalesResponseDto } from './dto/paginated-sucursales-response.dto';
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
		status: 404,
		description: 'Sucursal no encontrada',
	})
	update(@Param('id', ParseIntPipe) id: number, @Body() updateSucursalDto: UpdateSucursalDto) {
		return this.sucursalesService.update(id, updateSucursalDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Eliminar sucursal' })
	@ApiResponse({
		status: 200,
		description: 'Sucursal eliminada exitosamente',
	})
	@ApiResponse({
		status: 404,
		description: 'Sucursal no encontrada',
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
	toggleStatus(@Param('id', ParseIntPipe) id: number) {
		return this.sucursalesService.toggleStatus(id);
	}
}
