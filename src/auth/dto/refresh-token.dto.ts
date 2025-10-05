import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
	@ApiProperty({ description: 'Token de refresh para renovar el access token' })
	@IsNotEmpty()
	@IsString()
	refreshToken: string;
}
