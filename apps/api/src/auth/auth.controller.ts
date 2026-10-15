import { Body, Controller, Get, HttpCode, Inject, Post, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { NFS_GATEWAY, type NfsGateway } from '../nfs/nfs-gateway';
import { CurrentSession, SessionGuard } from './session.guard';
import { type Session, SessionService } from './session.service';

class LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(NFS_GATEWAY) private readonly nfs: NfsGateway,
    private readonly sessions: SessionService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const account = await this.nfs.authenticate(dto.username.trim(), dto.password);
    this.sessions.issue(res, account);
    return { account };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    this.sessions.clear(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentSession() session: Session) {
    return { account: { username: session.username, persona: session.persona } };
  }
}
