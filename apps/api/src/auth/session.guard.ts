import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';
import { Session, SessionService } from './session.service';

type RequestWithSession = Request & { session?: Session };

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithSession>();
    const session = this.sessions.read(req);
    if (!session) throw new UnauthorizedException({ code: 'NOT_AUTHENTICATED', message: 'Iniciá sesión para continuar' });
    req.session = session;
    return true;
  }
}

export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<RequestWithSession>().session!,
);
