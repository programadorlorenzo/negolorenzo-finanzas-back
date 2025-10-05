import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
	@ApiProperty({ description: 'Email del usuario', example: 'walter@consorciolorenzo.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ description: 'Contraseña del usuario', example: 'Walter123!' })
	@IsNotEmpty()
	@IsString()
	password: string;
}
