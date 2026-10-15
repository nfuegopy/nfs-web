import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { SessionService } from '../auth/session.service';
import { NFS_GATEWAY, type NfsGateway } from '../nfs/nfs-gateway';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
    @Inject(NFS_GATEWAY) private readonly nfs: NfsGateway,
    private readonly sessions: SessionService,
  ) {}

  /** Crea la cuenta en el servidor del juego y deja la sesión web iniciada. */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async create(@Body() dto: CreateAccountDto, @Res({ passthrough: true }) res: Response) {
    const account = await this.nfs.createAccount(dto);
    this.sessions.issue(res, account);
    return { success: true, message: 'Cuenta creada correctamente', account };
  }
}
