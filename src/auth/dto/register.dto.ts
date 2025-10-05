import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
	@ApiProperty({ description: 'Nombre del usuario', example: 'Walter', required: false })
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiProperty({ description: 'Apellido del usuario', example: 'Lorenzo', required: false })
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiProperty({ description: 'Email del usuario', example: 'walter@consorciolorenzo.com' })
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'Contraseña del usuario (mínimo 8 caracteres)',
		example: 'Walter123!',
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(8)
	password: string;

	@ApiProperty({
		description: 'ID de la organización',
		example: 1,
		required: false,
	})
	@IsOptional()
	organizationId?: number;

	@ApiProperty({ description: 'ID de la sucursal', example: 1, required: false })
	@IsOptional()
	sucursalId?: number;

	@ApiProperty({ description: 'ID del rol', example: 1, required: false })
	@IsOptional()
	roleId?: number;
}
