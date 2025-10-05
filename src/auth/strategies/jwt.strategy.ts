import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private authService: AuthService,
		private configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_ACCESS_SECRET') || 'default-secret',
		});
	}

	async validate(payload: JwtPayload): Promise<any> {
		const user = await this.authService.validateUser(payload);
		return {
			...user,
			orgId: payload.orgId,
			sucursalId: payload.sucursalId,
			roles: payload.roles,
			permissions: payload.permissions,
		};
	}
}
