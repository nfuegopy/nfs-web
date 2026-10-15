import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AccountsController } from './accounts.controller';
import { ProfileController } from './profile.controller';

@Module({
  imports: [AuthModule],
  controllers: [AccountsController, ProfileController],
})
export class AccountsModule {}
