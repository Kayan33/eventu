import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export const CurrentActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request: { user: JwtPayload } = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
