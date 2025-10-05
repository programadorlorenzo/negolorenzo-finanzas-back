import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory, AbilityContext, AppAbility } from './ability.factory';

export interface PolicyHandler {
	handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandlerType = PolicyHandler | PolicyHandlerCallback;

export const CHECK_POLICIES_KEY = 'check_policies';

@Injectable()
export class PoliciesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private abilityFactory: AbilityFactory,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const policyHandlers =
			this.reflector.get<PolicyHandlerType[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

		if (policyHandlers.length === 0) {
			return true;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const request = context.switchToHttp().getRequest();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		const user = request.user;

		if (!user) {
			throw new ForbiddenException('User not authenticated');
		}

		const abilityContext: AbilityContext = {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			userId: user.id,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			organizationId: user.orgId,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			branchId: user.branchId,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			roles: user.roles || [],
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			permissions: user.permissions || [],
		};

		const ability = this.abilityFactory.createForUser(abilityContext);

		const hasPermission = policyHandlers.every(handler => this.execPolicyHandler(handler, ability));

		if (!hasPermission) {
			throw new ForbiddenException('Insufficient permissions');
		}

		return true;
	}

	private execPolicyHandler(handler: PolicyHandlerType, ability: AppAbility): boolean {
		if (typeof handler === 'function') {
			return handler(ability);
		}
		return handler.handle(ability);
	}
}
