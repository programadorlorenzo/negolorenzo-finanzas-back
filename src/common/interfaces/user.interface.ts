export interface AuthenticatedUser {
	id: number;
	email: string;
	orgId: number;
	sucursalId?: number;
	roles: string[];
	permissions: string[];
}

export interface RequestWithUser extends Request {
	user: AuthenticatedUser;
}
