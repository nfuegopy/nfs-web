import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NfsService } from './nfs.service';
import { MockNfsAccountProvider } from './mock-nfs-account.provider';
import { PythonNfsAccountProvider } from './python-nfs-account.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    NfsService,
    {
      provide: 'NfsAccountProvider',
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('NFS_PROVIDER');
        if (provider === 'python') {
          return new PythonNfsAccountProvider(configService);
        }
        return new MockNfsAccountProvider();
      },
      inject: [ConfigService],
    },
  ],
  exports: ['NfsAccountProvider', NfsService],
})
export class NfsModule {}

