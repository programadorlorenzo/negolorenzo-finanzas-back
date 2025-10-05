import { SetMetadata } from '@nestjs/common';
import { PolicyHandlerType, CHECK_POLICIES_KEY } from '../policies.guard';

export const CheckPolicies = (...handlers: PolicyHandlerType[]) =>
	SetMetadata(CHECK_POLICIES_KEY, handlers);
