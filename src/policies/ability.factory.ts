import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType } from '@casl/ability';

export enum Action {
	MANAGE = 'manage',
	CREATE = 'create',
	READ = 'read',
	UPDATE = 'update',
	DELETE = 'delete',
	APPROVE = 'approve',
	REJECT = 'reject',
}

export type Subjects =
	| 'User'
	| 'Organization'
	| 'Branch'
	| 'Role'
	| 'Permission'
	| 'Order'
	| 'Invoice'
	| 'Report'
	| 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export interface AbilityContext {
	userId: string;
	organizationId: string;
	branchId?: string;
	roles: string[];
	permissions: string[];
}

@Injectable()
export class AbilityFactory {
	createForUser(context: AbilityContext): AppAbility {
		const { can, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
			Ability as AbilityClass<AppAbility>,
		);

		// Permisos basados en roles (RBAC)
		if (context.roles.includes('ADMIN')) {
			can(Action.MANAGE, 'all');
		} else if (context.roles.includes('MANAGER')) {
			can(Action.MANAGE, 'Organization');
			can(Action.MANAGE, 'Branch');
			can(Action.MANAGE, 'User');
			can(Action.READ, 'Report');
			can(Action.MANAGE, 'Order');
			can(Action.MANAGE, 'Invoice');
		} else if (context.roles.includes('SELLER')) {
			can(Action.READ, 'User');
			can(Action.UPDATE, 'User');
			can(Action.CREATE, 'Order');
			can(Action.READ, 'Order');
			can(Action.UPDATE, 'Order');
			can(Action.READ, 'Invoice');
		} else if (context.roles.includes('VIEWER')) {
			can(Action.READ, 'User');
			can(Action.READ, 'Order');
			can(Action.READ, 'Invoice');
		}

		return build({
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			detectSubjectType: (item: any) => item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
