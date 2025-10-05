export interface AuthenticatedUser {
	id: number;
	email: string;
	role: string;
	sucursales: string[];
	permissions: string[];
}

export interface RequestWithUser extends Request {
	user: AuthenticatedUser;
}
