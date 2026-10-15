import { Module } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { AuthController } from './auth.controller';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';

@Module({
  controllers: [AuthController],
  providers: [SessionService, SessionGuard, MailService],
  exports: [SessionService, SessionGuard],
})
export class AuthModule {}
