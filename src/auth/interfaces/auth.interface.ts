export interface JwtPayload {
	sub: number; // User ID
	email: string;
	role: string;
	sucursales: string[];
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
	role: string;
	sucursales: string[];
	permissions: string[];
}

export interface RefreshResponse {
	accessToken: string;
	refreshToken: string;
}
