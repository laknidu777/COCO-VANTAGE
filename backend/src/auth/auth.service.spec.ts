jest.mock('@nestjs/jwt', () => ({
  JwtService: class {
    signAsync = jest.fn();
  },
}));

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminRole, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService (Customer & Admin)', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    adminUser: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      adminUser: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('mock_jwt_secret_32_chars_long!!') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Customer Registration', () => {
    it('should successfully register a new customer with hashed password and CUSTOMER role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'user-uuid-1',
          email: data.email,
          role: data.role,
          createdAt: new Date(),
        }),
      );

      const result = await service.registerCustomer({
        email: 'Customer@example.com',
        password: 'Password123!',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'customer@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'customer@example.com',
            role: UserRole.CUSTOMER,
            isActive: true,
          }),
        }),
      );
      // Ensure password was hashed with bcrypt
      const createCall = prisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).not.toBe('Password123!');
      expect(await bcrypt.compare('Password123!', createCall.data.passwordHash)).toBe(true);

      expect(result).toHaveProperty('accessToken', 'mock_jwt_token');
      expect(result.customer.email).toBe('customer@example.com');
      expect(result.customer.role).toBe(UserRole.CUSTOMER);
      // Plaintext password is never returned
      expect(result).not.toHaveProperty('password');
      expect(result.customer).not.toHaveProperty('passwordHash');
    });

    it('should reject duplicate email registration with ConflictException', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
      });

      await expect(
        service.registerCustomer({
          email: 'EXISTING@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('Customer Login', () => {
    it('should successfully log in an active customer with valid credentials', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-2',
        email: 'customer@example.com',
        passwordHash,
        role: UserRole.CUSTOMER,
        isActive: true,
        createdAt: new Date(),
      });

      const result = await service.loginCustomer({
        email: 'Customer@Example.com',
        password: 'CorrectPassword!',
      });

      expect(result.accessToken).toBe('mock_jwt_token');
      expect(result.customer.email).toBe('customer@example.com');
      expect(result.customer.role).toBe(UserRole.CUSTOMER);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-uuid-2',
          role: UserRole.CUSTOMER,
          type: 'customer',
        }),
      );
    });

    it('should reject login if customer does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.loginCustomer({
          email: 'unknown@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login if password does not match', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-2',
        email: 'customer@example.com',
        passwordHash,
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      await expect(
        service.loginCustomer({
          email: 'customer@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login if user is inactive or not a CUSTOMER', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-3',
        email: 'inactive@example.com',
        passwordHash,
        role: UserRole.CUSTOMER,
        isActive: false,
      });

      await expect(
        service.loginCustomer({
          email: 'inactive@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Customer Profile Retrieval', () => {
    it('should return profile for active customer', async () => {
      const now = new Date();
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'customer@example.com',
        role: UserRole.CUSTOMER,
        isActive: true,
        createdAt: now,
      });

      const profile = await service.getCustomerProfile('user-uuid-1');
      expect(profile).toEqual({
        id: 'user-uuid-1',
        email: 'customer@example.com',
        role: UserRole.CUSTOMER,
        createdAt: now,
      });
    });

    it('should throw UnauthorizedException if customer is not found or inactive', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getCustomerProfile('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Preserved Admin Login', () => {
    it('should continue to authenticate admin accounts via AdminUser table', async () => {
      const passwordHash = await bcrypt.hash('AdminPassword123!', 10);
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-uuid-1',
        email: 'admin@cocovantage.com',
        name: 'Administrator',
        passwordHash,
        role: AdminRole.ADMIN,
        isActive: true,
      });
      prisma.adminUser.update.mockResolvedValue({});

      const result = await service.login({
        email: 'admin@cocovantage.com',
        password: 'AdminPassword123!',
      });

      expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@cocovantage.com' },
      });
      expect(result.admin.role).toBe(AdminRole.ADMIN);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'admin-uuid-1',
          role: AdminRole.ADMIN,
          type: 'admin',
        }),
      );
    });
  });
});
