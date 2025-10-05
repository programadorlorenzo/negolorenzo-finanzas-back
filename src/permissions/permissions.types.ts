export enum Action {
	Create = 'create',
	Read = 'read',
	Update = 'update',
	Delete = 'delete',
	Manage = 'manage', // Includes all actions
}

export enum Subject {
	User = 'User',
	Cuenta = 'Cuenta',
	Sucursal = 'Sucursal',
	All = 'all',
}
