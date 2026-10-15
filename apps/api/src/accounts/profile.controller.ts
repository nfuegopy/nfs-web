import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { CurrentSession, SessionGuard } from '../auth/session.guard';
import type { Session } from '../auth/session.service';
import { NFS_GATEWAY, type NfsGateway } from '../nfs/nfs-gateway';

@Controller('me')
@UseGuards(SessionGuard)
export class ProfileController {
  constructor(@Inject(NFS_GATEWAY) private readonly nfs: NfsGateway) {}

  @Get('profile')
  profile(@CurrentSession() session: Session) {
    return this.nfs.getProfile(session.username);
  }
}
