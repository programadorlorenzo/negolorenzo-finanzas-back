import { SetMetadata } from '@nestjs/common';
import { Action, Subject } from '../../permissions/permissions.types';

export const PERMISSIONS_KEY = 'permissions';
export const CheckPermissions = (action: Action, subject: Subject) =>
	SetMetadata(PERMISSIONS_KEY, [action, subject]);
