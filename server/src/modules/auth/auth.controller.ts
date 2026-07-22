import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Self-service sign-up: creates a new tenant + its admin user',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Staff (User) login' })
  loginUser(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }

  @Public()
  @Post('client-login')
  @ApiOperation({ summary: 'Client (customer) login' })
  loginClient(@Body() dto: LoginDto) {
    return this.authService.loginClient(dto);
  }
}
