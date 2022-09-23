import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserData = createParamDecorator(
  (data: unknown, context: ExecutionContext): Object | null => {
    const request = context.switchToHttp().getRequest();
    
    // if(!request.user) return null
    const { sub, username, email } = request.user;

    return { sub, username, email };
  },
);
