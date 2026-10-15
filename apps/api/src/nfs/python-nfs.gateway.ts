import { Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { AccountSummary, NfsError, NfsGateway } from './nfs-gateway';

const BRIDGE_TIMEOUT_MS = 15_000;

/** Ejecuta el bridge de Python: los datos viajan sólo por stdin/stdout, nunca como argumentos. */
export class PythonNfsGateway implements NfsGateway {
  private readonly logger = new Logger(PythonNfsGateway.name);

  constructor(
    private readonly pythonBin: string,
    private readonly bridgePath: string,
  ) {}

  private run<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.pythonBin, [this.bridgePath], { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      const timer = setTimeout(() => child.kill('SIGKILL'), BRIDGE_TIMEOUT_MS);

      child.stdout.on('data', (chunk) => (stdout += chunk));
      child.stderr.on('data', (chunk) => (stderr += chunk));
      child.on('error', (error) => {
        clearTimeout(timer);
        this.logger.error(`No se pudo ejecutar el bridge (${action}): ${error.message}`);
        reject(new NfsError('NFS_SERVER_ERROR', 'El servidor del juego no está disponible'));
      });
      child.on('close', (code, signal) => {
        clearTimeout(timer);
        if (stderr.trim()) this.logger.warn(`Bridge ${action}: ${stderr.trim()}`);

        let result: { success?: boolean; code?: string; message?: string; [key: string]: unknown };
        try {
          result = JSON.parse(stdout);
        } catch {
          this.logger.error(`Respuesta inválida del bridge (${action}), exit=${code} signal=${signal}`);
          return reject(new NfsError('NFS_SERVER_ERROR', 'El servidor del juego no respondió correctamente'));
        }
        if (result.success === true && code === 0) {
          const { success: _success, ...payload } = result;
          return resolve(payload as T);
        }
        const { success: _success, code: errorCode, message, ...extra } = result;
        reject(new NfsError(errorCode ?? 'NFS_SERVER_ERROR', message ?? 'Error del servidor del juego', extra));
      });

      child.stdin.end(JSON.stringify({ action, ...data }));
    });
  }

  async createAccount(data: { username: string; persona: string; email: string; password: string }) {
    const { account } = await this.run<{ account: AccountSummary }>('createAccount', data);
    return account;
  }

  async authenticate(username: string, password: string) {
    const { account } = await this.run<{ account: AccountSummary }>('authenticate', { username, password });
    return account;
  }

  async changePassword(username: string, currentPassword: string, newPassword: string) {
    await this.run('changePassword', { username, currentPassword, newPassword });
  }

  async passwordResetTarget(email: string) {
    const { account } = await this.run<{ account: { username: string; fingerprint: string } | null }>('passwordResetTarget', { email });
    return account;
  }

  async resetPassword(username: string, fingerprint: string, newPassword: string) {
    await this.run('resetPassword', { username, fingerprint, newPassword });
  }

  getProfile(username: string) {
    return this.run('getProfile', { username });
  }

  leaderboard(game: string, category: number) {
    return this.run('leaderboard', { game, category });
  }

  summary() {
    return this.run<{ players: number; online: number; races: number }>('summary');
  }
}
