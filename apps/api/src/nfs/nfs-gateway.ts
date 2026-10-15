import { HttpException, HttpStatus } from '@nestjs/common';

export const NFS_GATEWAY = 'NfsGateway';

export interface AccountSummary {
  username: string;
  persona: string;
}

export interface NfsGateway {
  createAccount(data: { username: string; persona: string; email: string; password: string }): Promise<AccountSummary>;
  authenticate(username: string, password: string): Promise<AccountSummary>;
  getProfile(username: string): Promise<unknown>;
  leaderboard(game: string, category: number): Promise<unknown>;
  summary(): Promise<{ players: number; online: number; races: number }>;
}

const STATUS_BY_CODE: Record<string, HttpStatus> = {
  ACCOUNT_EXISTS: HttpStatus.CONFLICT,
  PERSONA_EXISTS: HttpStatus.CONFLICT,
  EMAIL_EXISTS: HttpStatus.CONFLICT,
  EMAIL_BLOCKED: HttpStatus.FORBIDDEN,
  INVALID_USERNAME: HttpStatus.BAD_REQUEST,
  INVALID_PERSONA: HttpStatus.BAD_REQUEST,
  INVALID_PASSWORD: HttpStatus.BAD_REQUEST,
  INVALID_EMAIL: HttpStatus.BAD_REQUEST,
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  ACCOUNT_LOCKED: HttpStatus.TOO_MANY_REQUESTS,
  ACCOUNT_BANNED: HttpStatus.FORBIDDEN,
  ACCOUNT_DISABLED: HttpStatus.FORBIDDEN,
  ACCOUNT_NOT_FOUND: HttpStatus.NOT_FOUND,
};

/** Error devuelto por el servidor NFS, con un código estable que entiende el frontend. */
export class NfsError extends HttpException {
  constructor(code: string, message: string, extra: Record<string, unknown> = {}) {
    super({ code, message, ...extra }, STATUS_BY_CODE[code] ?? HttpStatus.BAD_GATEWAY);
  }
}
