import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NFS_GATEWAY } from './nfs-gateway';
import { MockNfsGateway } from './mock-nfs.gateway';
import { PythonNfsGateway } from './python-nfs.gateway';

@Global()
@Module({
  providers: [
    {
      provide: NFS_GATEWAY,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('NFS_PROVIDER')?.trim();
        if (provider === 'mock') return new MockNfsGateway();
        if (provider === 'python') {
          const bridgePath = config.get<string>('NFS_BRIDGE_PATH');
          if (!bridgePath) throw new Error('NFS_BRIDGE_PATH es obligatorio con NFS_PROVIDER=python');
          return new PythonNfsGateway(config.get<string>('NFS_PYTHON_BIN') || 'python3', bridgePath);
        }
        // Sin valor explícito no arrancamos: así nunca se usa el mock en producción por accidente.
        throw new Error(`NFS_PROVIDER debe ser "python" o "mock" (valor actual: ${JSON.stringify(provider)})`);
      },
    },
  ],
  exports: [NFS_GATEWAY],
})
export class NfsModule {}
