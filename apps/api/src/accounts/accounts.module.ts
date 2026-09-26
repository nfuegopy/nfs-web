import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { NfsModule } from '../nfs/nfs.module';

@Module({
  imports: [NfsModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
