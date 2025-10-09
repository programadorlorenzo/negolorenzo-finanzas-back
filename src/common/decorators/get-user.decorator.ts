import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser, RequestWithUser } from '../interfaces/user.interface';

export const GetUser = createParamDecorator(
	(
		data: keyof AuthenticatedUser | undefined,
		ctx: ExecutionContext,
	): AuthenticatedUser | string | number | string[] => {
		const request = ctx.switchToHttp().getRequest<RequestWithUser>();
		const user = request.user;

		return data ? user?.[data] : user;
	},
);
