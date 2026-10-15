import { BadRequestException, Controller, Get, Inject, Query } from '@nestjs/common';
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
  leaderboard(@Query('game') game = 'underground2', @Query('category') category = '0') {
    // Sólo valores exactos conocidos: cualquier otra cosa se rechaza antes de llegar al servidor del juego.
    if (game !== 'underground2' || typeof category !== 'string' || !/^[0-5]$/.test(category)) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Parámetros de ranking inválidos' });
    }
    return this.nfs.leaderboard(game, Number(category));
  }
}
