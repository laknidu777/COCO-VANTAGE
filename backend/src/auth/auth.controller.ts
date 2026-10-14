
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated admin' })
  getMe(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
