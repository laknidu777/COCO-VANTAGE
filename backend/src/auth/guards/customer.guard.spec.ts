import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CustomerGuard } from './customer.guard';

describe('CustomerGuard', () => {
  let guard: CustomerGuard;

  beforeEach(() => {
    guard = new CustomerGuard();
  });

  const createMockContext = (user?: { role: string }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext);

  it('should allow access if user has CUSTOMER role', () => {
    const context = createMockContext({ role: 'CUSTOMER' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user has ADMIN role', () => {
    const context = createMockContext({ role: 'ADMIN' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user has SUPER_ADMIN role', () => {
    const context = createMockContext({ role: 'SUPER_ADMIN' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not attached to request', () => {
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
