jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    class MockAuthGuard {
      canActivate() {
        return true;
      }
    }
    return MockAuthGuard;
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CustomerOrdersController } from './customer-orders.controller';
import { CustomerOrdersService } from './customer-orders.service';
import { CustomerGuard } from '../../auth/guards/customer.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('CustomerOrdersController', () => {
  let controller: CustomerOrdersController;
  let service: CustomerOrdersService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerOrdersController],
      providers: [
        {
          provide: CustomerOrdersService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CustomerOrdersController>(CustomerOrdersController);
    service = module.get<CustomerOrdersService>(CustomerOrdersService);
  });

  it('delegates findAll using authenticated user.id from request token', async () => {
    const mockRequest = {
      user: {
        id: 'cust-uuid-1',
        email: 'customer@example.com',
        role: 'CUSTOMER',
      },
    } as any;

    mockService.findAll.mockResolvedValue({ data: [], pagination: {} });

    await controller.findAll(mockRequest, { page: 2, limit: 10 });

    expect(service.findAll).toHaveBeenCalledWith('cust-uuid-1', 2, 10);
  });

  it('delegates findOne using authenticated user.id from request token', async () => {
    const mockRequest = {
      user: {
        id: 'cust-uuid-1',
        email: 'customer@example.com',
        role: 'CUSTOMER',
      },
    } as any;

    mockService.findOne.mockResolvedValue({ id: 'order-uuid-9' });

    await controller.findOne(mockRequest, 'order-uuid-9');

    expect(service.findOne).toHaveBeenCalledWith('cust-uuid-1', 'order-uuid-9');
  });
});
