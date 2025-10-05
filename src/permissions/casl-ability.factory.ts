import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Action, Subject } from './permissions.types';
import { User } from '../entities/user.entity';
import { Cuenta } from '../entities/cuenta.entity';
import type { AuthenticatedUser } from '../common/interfaces/user.interface';

type AppSubjects = User | Cuenta | 'all' | 'User' | 'Cuenta';
export type AppAbility = Ability<[Action, AppSubjects]>;

@Injectable()
export class CaslAbilityFactory {
	createForUser(user: AuthenticatedUser): AppAbility {
		const { can, cannot, build } = new AbilityBuilder<Ability<[Action, AppSubjects]>>(
			Ability as AbilityClass<AppAbility>,
		);

		// Permisos basados en roles (RBAC)
		if (user.role === 'SUPERADMIN') {
			can(Action.Manage, 'all');
		} else if (user.role === 'ADMIN') {
			can(Action.Manage, 'Cuenta');
			can(Action.Manage, 'User');
		} else if (user.role === 'MANAGER') {
			can(Action.Read, 'Cuenta');
			can(Action.Update, 'Cuenta');
			can(Action.Create, 'Cuenta');
			can(Action.Read, 'User');
		} else {
			// Usuario normal - solo puede ver y gestionar sus propios datos
			can(Action.Read, 'User', { id: user.id });
			can(Action.Update, 'User', { id: user.id });
		}

		// Permisos adicionales basados en atributos (ABAC)
		// Los usuarios pueden gestionar sus propias cuentas
		can([Action.Read, Action.Update], 'Cuenta', { createdBy: user.id });

		// Solo administradores pueden eliminar cuentas
		if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
			can(Action.Delete, 'Cuenta');
		}

		return build();
	}
}
