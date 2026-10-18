import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    type?: string;
  };
}

@Injectable()
export class CustomerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Customer access required.');
    }

    return true;
  }
}
