export interface JwtPayload {
	sub: number; // User ID
	email: string;
	orgId: number;
	sucursalId?: number;
	roles: string[];
	permissions: string[];
	iat?: number;
	exp?: number;
}

export interface LoginResponse {
	user: UserResponse;
	accessToken: string;
	refreshToken: string;
}

export interface UserResponse {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	status: string;
	organizations: UserOrganizationResponse[];
}

export interface UserOrganizationResponse {
	id: number;
	organizationId: number;
	organizationName: string;
	sucursalId?: number;
	sucursalName?: string;
	roleId: number;
	roleName: string;
	permissions: string[];
}

export interface RefreshResponse {
	accessToken: string;
	refreshToken: string;
}
