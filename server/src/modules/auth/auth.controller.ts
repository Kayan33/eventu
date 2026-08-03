import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentActor } from './decorators/current-actor.decorator';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
} from './auth.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, accessToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: isProduction,
      // Cross-site cookies (frontend and backend on different domains in
      // production) require SameSite=None, which browsers only honor when
      // paired with Secure. Locally, front/back share "localhost" so Lax works.
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
      path: '/',
    });
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Self-service sign-up: creates a new tenant + its admin user',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, actor } = await this.authService.register(dto);
    this.setAuthCookie(res, accessToken);
    return { actor };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Staff (User) login' })
  async loginUser(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, actor } = await this.authService.loginUser(dto);
    this.setAuthCookie(res, accessToken);
    return { actor };
  }

  @Public()
  @Post('client-login')
  @ApiOperation({ summary: 'Client (customer) login' })
  async loginClient(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, actor } = await this.authService.loginClient(dto);
    this.setAuthCookie(res, accessToken);
    return { actor };
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Clear the session cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      path: '/',
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    return { success: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the currently authenticated actor' })
  me(@CurrentActor() actor: JwtPayload) {
    return { actor };
  }
}
