import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
	Query,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Cuenta } from '../entities/cuenta.entity';
import type { AuthenticatedUser } from '../common/interfaces/user.interface';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Action, Subject } from 'src/permissions/permissions.types';
import { CuentasService } from './cuentas.service';
import { CheckPermissions } from 'src/common/decorators/permissions.decorator';
import { CreateCuentaDto, UpdateCuentaDto } from './dto';

@ApiTags('Cuentas Bancarias')
@ApiBearerAuth()
@Controller('cuentas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CuentasController {
	constructor(private readonly cuentasService: CuentasService) {}

	@ApiOperation({ summary: 'Crear nueva cuenta bancaria' })
	@ApiResponse({ status: 201, description: 'Cuenta creada exitosamente', type: Cuenta })
	@ApiBadRequestResponse({ description: 'Datos inválidos' })
	@ApiUnauthorizedResponse({ description: 'No autorizado' })
	@ApiForbiddenResponse({ description: 'Sin permisos para crear cuentas' })
	@CheckPermissions(Action.Create, Subject.Cuenta)
	@Post()
	create(
		@Body() createCuentaDto: CreateCuentaDto,
		@Request() req: { user: AuthenticatedUser },
	): Promise<Cuenta> {
		return this.cuentasService.create(createCuentaDto, req.user.id);
	}

	@ApiOperation({ summary: 'Obtener todas las cuentas bancarias' })
	@ApiResponse({
		status: 200,
		description: 'Lista de cuentas obtenida exitosamente',
		type: [Cuenta],
	})
	@ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de cuenta' })
	@ApiQuery({ name: 'moneda', required: false, description: 'Filtrar por moneda' })
	@ApiQuery({ name: 'sucursalId', required: false, description: 'Filtrar por sucursal' })
	@ApiUnauthorizedResponse({ description: 'No autorizado' })
	@ApiForbiddenResponse({ description: 'Sin permisos para ver cuentas' })
	@CheckPermissions(Action.Read, Subject.Cuenta)
	@Get()
	findAll(
		@Query('tipo') tipo?: string,
		@Query('moneda') moneda?: string,
		@Query('sucursalId') sucursalId?: string,
		@Request() req?: { user: AuthenticatedUser },
	): Promise<Cuenta[]> {
		const filters = { tipo, moneda, sucursalId };
		return this.cuentasService.findAll(filters, req?.user);
	}

	@ApiOperation({ summary: 'Obtener cuenta bancaria por ID' })
	@ApiParam({ name: 'id', description: 'ID de la cuenta bancaria' })
	@ApiResponse({ status: 200, description: 'Cuenta encontrada exitosamente', type: Cuenta })
	@ApiNotFoundResponse({ description: 'Cuenta no encontrada' })
	@ApiUnauthorizedResponse({ description: 'No autorizado' })
	@ApiForbiddenResponse({ description: 'Sin permisos para ver esta cuenta' })
	@CheckPermissions(Action.Read, Subject.Cuenta)
	@Get(':id')
	findOne(@Param('id') id: number, @Request() req: { user: AuthenticatedUser }): Promise<Cuenta> {
		return this.cuentasService.findOne(id, req.user);
	}

	@ApiOperation({ summary: 'Actualizar cuenta bancaria' })
	@ApiParam({ name: 'id', description: 'ID de la cuenta bancaria' })
	@ApiResponse({ status: 200, description: 'Cuenta actualizada exitosamente', type: Cuenta })
	@ApiBadRequestResponse({ description: 'Datos inválidos' })
	@ApiNotFoundResponse({ description: 'Cuenta no encontrada' })
	@ApiUnauthorizedResponse({ description: 'No autorizado' })
	@ApiForbiddenResponse({ description: 'Sin permisos para actualizar esta cuenta' })
	@CheckPermissions(Action.Update, Subject.Cuenta)
	@Patch(':id')
	update(
		@Param('id') id: number,
		@Body() updateCuentaDto: UpdateCuentaDto,
		@Request() req: { user: AuthenticatedUser },
	): Promise<Cuenta> {
		return this.cuentasService.update(id, updateCuentaDto, req.user);
	}

	@ApiOperation({ summary: 'Eliminar cuenta bancaria' })
	@ApiParam({ name: 'id', description: 'ID de la cuenta bancaria' })
	@ApiResponse({ status: 204, description: 'Cuenta eliminada exitosamente' })
	@ApiNotFoundResponse({ description: 'Cuenta no encontrada' })
	@ApiUnauthorizedResponse({ description: 'No autorizado' })
	@ApiForbiddenResponse({ description: 'Sin permisos para eliminar esta cuenta' })
	@CheckPermissions(Action.Delete, Subject.Cuenta)
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id') id: number, @Request() req: { user: AuthenticatedUser }): Promise<void> {
		return this.cuentasService.remove(id, req.user);
	}

	@ApiOperation({ summary: 'Obtener mis cuentas bancarias' })
	@ApiResponse({ status: 200, description: 'Mis cuentas obtenidas exitosamente', type: [Cuenta] })
	@ApiUnauthorizedResponse({ description: 'No autorizado' })
	@Get('mis-cuentas')
	findMyCuentas(@Request() req: { user: AuthenticatedUser }): Promise<Cuenta[]> {
		return this.cuentasService.findUserCuentas(req.user.id);
	}

	@ApiOperation({ summary: 'Transferir propiedad de cuenta bancaria' })
	@ApiParam({ name: 'id', description: 'ID de la cuenta bancaria' })
	@ApiParam({ name: 'newOwnerId', description: 'ID del nuevo propietario' })
	@ApiResponse({ status: 200, description: 'Propiedad transferida exitosamente', type: Cuenta })
	@ApiNotFoundResponse({ description: 'Cuenta o usuario no encontrado' })
	@ApiUnauthorizedResponse({ description: 'No autorizado' })
	@ApiForbiddenResponse({ description: 'Sin permisos para transferir esta cuenta' })
	@CheckPermissions(Action.Manage, Subject.Cuenta)
	@Patch(':id/transfer/:newOwnerId')
	transferOwnership(
		@Param('id') id: number,
		@Param('newOwnerId') newOwnerId: number,
		@Request() req: { user: AuthenticatedUser },
	): Promise<Cuenta> {
		return this.cuentasService.transferOwnership(id, newOwnerId, req.user);
	}
}
