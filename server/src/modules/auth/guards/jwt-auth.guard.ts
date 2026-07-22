import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ACTOR_TYPE_KEY } from '../decorators/actor-type.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRole } from '../../../common/enums/user-role.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request: { user: JwtPayload } = context.switchToHttp().getRequest();

    const allowedTypes = this.reflector.getAllAndOverride<
      Array<JwtPayload['type']>
    >(ACTOR_TYPE_KEY, [context.getHandler(), context.getClass()]);

    if (allowedTypes && allowedTypes.length > 0) {
      if (!allowedTypes.includes(request.user.type)) {
        throw new ForbiddenException(
          'This route is not allowed for this actor type',
        );
      }
    }

    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowedRoles && allowedRoles.length > 0) {
      if (
        request.user.type !== 'user' ||
        !allowedRoles.includes(request.user.role)
      ) {
        throw new ForbiddenException('Your role does not allow this action');
      }
    }

    return true;
  }
}
