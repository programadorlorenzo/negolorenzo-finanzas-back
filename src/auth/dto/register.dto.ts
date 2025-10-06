import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray } from 'class-validator';
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
		description: 'Rol del usuario',
		example: 'Manager',
		required: false,
	})
	@IsOptional()
	@IsString()
	role?: string;

	@ApiProperty({
		description: 'Sucursales asignadas al usuario',
		example: ['Sucursal Central', 'Sucursal Norte'],
		required: false,
	})
	@IsOptional()
	@IsArray()
	sucursales?: string[];

	@ApiProperty({
		description: 'Permisos del usuario',
		example: ['read', 'create', 'update'],
		required: false,
	})
	@IsOptional()
	@IsArray()
	permissions?: string[];
}
