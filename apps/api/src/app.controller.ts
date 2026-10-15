import { Controller, DefaultValuePipe, Get, Inject, ParseIntPipe, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { NFS_GATEWAY, type NfsGateway } from './nfs/nfs-gateway';

/** Datos públicos: no requieren sesión. */
@Controller()
@SkipThrottle()
export class AppController {
  constructor(@Inject(NFS_GATEWAY) private readonly nfs: NfsGateway) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Get('summary')
  summary() {
    return this.nfs.summary();
  }

  @Get('leaderboard')
  leaderboard(
    @Query('game', new DefaultValuePipe('underground2')) game: string,
    @Query('category', new DefaultValuePipe(0), ParseIntPipe) category: number,
  ) {
    return this.nfs.leaderboard(game.slice(0, 32), category);
  }
}
