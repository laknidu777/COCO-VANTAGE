
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CustomerGuard } from './guards/customer.guard';
import { AdminRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

interface AuthenticatedAdminRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
  };
}

interface AuthenticatedCustomerRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // -------------------------------------------------------------
  // Customer Endpoints
  // -------------------------------------------------------------

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  registerCustomer(@Body() dto: RegisterCustomerDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('customer/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in as a customer' })
  loginCustomer(@Body() dto: LoginDto) {
    return this.authService.loginCustomer(dto);
  }

  @Get('customer/me')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated customer profile' })
  getCustomerMe(@Req() req: AuthenticatedCustomerRequest) {
    return this.authService.getCustomerProfile(req.user.id);
  }

  // -------------------------------------------------------------
  // Admin Endpoints
  // -------------------------------------------------------------

  @Get('super-admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test super-admin authorization' })
  superAdminTest() {
    return {
      message: 'Super-admin authorization successful',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in to the admin dashboard' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated admin' })
  getMe(@Req() req: AuthenticatedAdminRequest) {
    return req.user;
  }
}
