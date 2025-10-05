import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, Subject } from '../../permissions/permissions.types';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { CaslAbilityFactory } from 'src/permissions/casl-ability.factory';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private caslAbilityFactory: CaslAbilityFactory,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredPermissions = this.reflector.getAllAndOverride<[Action, Subject]>(
			PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredPermissions) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest();
		const ability = this.caslAbilityFactory.createForUser(user);

		const [action, subject] = requiredPermissions;

		if (!ability.can(action, subject as any)) {
			throw new ForbiddenException('No tienes permisos para realizar esta acción');
		}

		return true;
	}
}
