import { Injectable, ConflictException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { NfsAccountProvider } from './nfs-account.provider';
import { spawn } from 'child_process';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PythonNfsAccountProvider implements NfsAccountProvider {
  private readonly logger = new Logger(PythonNfsAccountProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private async runBridgeCommand(action: string, data: any): Promise<any> {
    const pythonBin = this.configService.get<string>('NFS_PYTHON_BIN') || 'python3';
    const bridgePath = this.configService.get<string>('NFS_BRIDGE_PATH');

    if (!bridgePath) {
      this.logger.error('NFS_BRIDGE_PATH no está configurado');
      throw new InternalServerErrorException('NFS_SERVER_ERROR');
    }

    return new Promise((resolve, reject) => {
      const child = spawn(pythonBin, [bridgePath]);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
        this.logger.warn(`Bridge stderr: ${chunk.toString().trim()}`);
      });

      child.on('close', (code) => {
        try {
          if (!stdout.trim()) {
            throw new Error('Respuesta vacía del bridge');
          }
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          this.logger.error('Fallo al parsear la salida del bridge:', stdout);
          reject(new InternalServerErrorException('NFS_SERVER_ERROR'));
        }
      });

      child.on('error', (error) => {
        this.logger.error('Fallo al ejecutar el bridge:', error);
        reject(new InternalServerErrorException('NFS_SERVER_ERROR'));
      });

      const payload = { action, ...data };
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();
    });
  }

  async createAccount(data: {
    username: string;
    persona: string;
    password: string;
  }): Promise<void> {
    const result = await this.runBridgeCommand('createAccount', data);

    if (result.success === false) {
      const code = result.code || result.error;
      switch (code) {
        case 'ACCOUNT_EXISTS':
          throw new ConflictException('La cuenta ya existe');
        case 'PERSONA_EXISTS':
          throw new ConflictException('El nombre de jugador ya existe');
        case 'INVALID_USERNAME':
          throw new BadRequestException('Nombre de usuario inválido');
        case 'INVALID_PERSONA':
          throw new BadRequestException('Nombre de jugador inválido');
        case 'INVALID_PASSWORD':
          throw new BadRequestException('Contraseña inválida');
        case 'INVALID_JSON':
          throw new InternalServerErrorException('Error interno: JSON inválido');
        case 'NFS_SERVER_ERROR':
        default:
          throw new InternalServerErrorException('Error interno del servidor NFS');
      }
    }
  }

  async accountExists(username: string): Promise<boolean> {
    // Si el bridge soporta estas acciones, podríamos llamarlo.
    // De lo contrario, devolvemos false y permitimos que createAccount maneje el error ACCOUNT_EXISTS
    try {
      const result = await this.runBridgeCommand('checkAccount', { username });
      return result.exists === true;
    } catch {
      return false;
    }
  }

  async personaExists(persona: string): Promise<boolean> {
    try {
      const result = await this.runBridgeCommand('checkPersona', { persona });
      return result.exists === true;
    } catch {
      return false;
    }
  }
}
