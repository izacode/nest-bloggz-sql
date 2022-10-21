import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let cookies = request.cookies;
    if (!cookies?.refreshToken || typeof cookies?.refreshToken !== 'string')
      throw new UnauthorizedException();
    const refreshToken = cookies.refreshToken;
    return refreshToken;
  },
);
