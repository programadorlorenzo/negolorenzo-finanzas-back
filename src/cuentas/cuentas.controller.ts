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
import { CuentasService } from './cuentas.service';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { UpdateCuentaDto } from './dto/update-cuenta.dto';
import { FilterCuentasDto } from './dto/filter-cuentas.dto';
import { PaginatedCuentasResponseDto } from './dto/paginated-cuentas-response.dto';
import { Cuenta } from '../entities/cuenta.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cuentas')
@Controller('cuentas')
export class CuentasController {
	constructor(private readonly cuentasService: CuentasService) {}

	@Get()
	@ApiOperation({ summary: 'Obtener todas las cuentas con filtros y paginación' })
	@ApiResponse({
		status: 200,
		description: 'Lista de cuentas obtenida exitosamente',
		type: PaginatedCuentasResponseDto,
	})
	findAll(@Query() filters: FilterCuentasDto) {
		return this.cuentasService.findAll(filters);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Obtener cuenta por ID' })
	@ApiResponse({
		status: 200,
		description: 'Cuenta encontrada',
		type: Cuenta,
	})
	@ApiResponse({
		status: 404,
		description: 'Cuenta no encontrada',
	})
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.cuentasService.findOne(id);
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Crear nueva cuenta' })
	@ApiResponse({
		status: 201,
		description: 'Cuenta creada exitosamente',
		type: Cuenta,
	})
	@ApiResponse({
		status: 400,
		description: 'Datos de entrada inválidos',
	})
	@ApiResponse({
		status: 409,
		description: 'Ya existe una cuenta con ese número o CCI',
	})
	create(@Body() createCuentaDto: CreateCuentaDto) {
		return this.cuentasService.create(createCuentaDto);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Actualizar cuenta' })
	@ApiResponse({
		status: 200,
		description: 'Cuenta actualizada exitosamente',
		type: Cuenta,
	})
	@ApiResponse({
		status: 400,
		description: 'Datos de entrada inválidos',
	})
	@ApiResponse({
		status: 404,
		description: 'Cuenta no encontrada',
	})
	@ApiResponse({
		status: 409,
		description: 'Ya existe otra cuenta con ese número o CCI',
	})
	update(@Param('id', ParseIntPipe) id: number, @Body() updateCuentaDto: UpdateCuentaDto) {
		return this.cuentasService.update(id, updateCuentaDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Eliminar cuenta' })
	@ApiResponse({
		status: 200,
		description: 'Cuenta eliminada exitosamente',
	})
	@ApiResponse({
		status: 404,
		description: 'Cuenta no encontrada',
	})
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.cuentasService.remove(id);
	}

	@Patch(':id/toggle-status')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Cambiar estado activo/inactivo de la cuenta' })
	@ApiResponse({
		status: 200,
		description: 'Estado de la cuenta cambiado exitosamente',
		type: Cuenta,
	})
	@ApiResponse({
		status: 404,
		description: 'Cuenta no encontrada',
	})
	@ApiResponse({
		status: 400,
		description: 'Error al cambiar el estado de la cuenta',
	})
	toggleStatus(@Param('id', ParseIntPipe) id: number) {
		return this.cuentasService.toggleStatus(id);
	}

	@Get('active/list')
	@ApiOperation({ summary: 'Obtener todas las cuentas activas' })
	@ApiResponse({
		status: 200,
		description: 'Lista de cuentas activas obtenida exitosamente',
		type: [Cuenta],
	})
	@ApiResponse({
		status: 400,
		description: 'Error al obtener las cuentas activas',
	})
	findActiveCuentas() {
		return this.cuentasService.findActiveCuentas();
	}

	@Get('numero/:numeroCuenta')
	@ApiOperation({ summary: 'Obtener cuenta por número de cuenta' })
	@ApiResponse({
		status: 200,
		description: 'Cuenta encontrada',
		type: Cuenta,
	})
	@ApiResponse({
		status: 404,
		description: 'Cuenta no encontrada',
	})
	async findByNumeroCuenta(@Param('numeroCuenta') numeroCuenta: string) {
		const cuenta = await this.cuentasService.findByNumeroCuenta(numeroCuenta);
		if (!cuenta) {
			throw new NotFoundException(`Cuenta con número '${numeroCuenta}' no encontrada`);
		}
		return cuenta;
	}

	@Get('cci/:cci')
	@ApiOperation({ summary: 'Obtener cuenta por CCI' })
	@ApiResponse({
		status: 200,
		description: 'Cuenta encontrada',
		type: Cuenta,
	})
	@ApiResponse({
		status: 404,
		description: 'Cuenta no encontrada',
	})
	async findByCci(@Param('cci') cci: string) {
		const cuenta = await this.cuentasService.findByCci(cci);
		if (!cuenta) {
			throw new NotFoundException(`Cuenta con CCI '${cci}' no encontrada`);
		}
		return cuenta;
	}
}
