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
	| 'Sucursal'
	| 'Role'
	| 'Permission'
	| 'Order'
	| 'Invoice'
	| 'Report'
	| 'Cuenta'
	| 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export interface AbilityContext {
	userId: string;
	sucursalId?: string;
	role: string;
	sucursales: string[];
	permissions: string[];
}

@Injectable()
export class AbilityFactory {
	createForUser(context: AbilityContext): AppAbility {
		const { can, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
			Ability as AbilityClass<AppAbility>,
		);

		// Permisos basados en roles (RBAC)
		if (context.role === 'ADMIN') {
			can(Action.MANAGE, 'all');
		} else if (context.role === 'MANAGER') {
			can(Action.MANAGE, 'Sucursal');
			can(Action.MANAGE, 'User');
			can(Action.READ, 'Report');
			can(Action.MANAGE, 'Order');
			can(Action.MANAGE, 'Invoice');
			can(Action.MANAGE, 'Cuenta');
		} else if (context.role === 'SELLER') {
			can(Action.READ, 'User');
			can(Action.UPDATE, 'User');
			can(Action.CREATE, 'Order');
			can(Action.READ, 'Order');
			can(Action.UPDATE, 'Order');
			can(Action.READ, 'Invoice');
			can(Action.READ, 'Cuenta');
			can(Action.CREATE, 'Cuenta');
		} else if (context.role === 'VIEWER') {
			can(Action.READ, 'User');
			can(Action.READ, 'Order');
			can(Action.READ, 'Invoice');
			can(Action.READ, 'Cuenta');
		}

		return build({
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			detectSubjectType: (item: any) => item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
