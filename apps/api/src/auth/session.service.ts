import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';

export const SESSION_COOKIE = 'nfs_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface Session {
  username: string;
  persona: string;
  exp: number;
}

/** Sesión firmada (HMAC-SHA256) en una cookie httpOnly; no guarda contraseñas ni datos sensibles. */
@Injectable()
export class SessionService {
  private readonly secret: string;
  private readonly secure: boolean;

  constructor(config: ConfigService) {
    const secret = config.get<string>('SESSION_SECRET');
    const production = config.get<string>('NODE_ENV') === 'production';
    if (!secret || secret.length < 32) {
      if (production) throw new Error('SESSION_SECRET debe tener al menos 32 caracteres en producción');
    }
    this.secret = secret || 'solo-desarrollo-local-no-usar-en-produccion';
    this.secure = production || config.get<string>('COOKIE_SECURE') === 'true';
  }

  private sign(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  issue(res: Response, account: { username: string; persona: string }) {
    const payload: Session = { ...account, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    res.cookie(SESSION_COOKIE, `${body}.${this.sign(body)}`, {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS * 1000,
    });
  }

  clear(res: Response) {
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: this.secure, sameSite: 'lax', path: '/' });
  }

  read(req: Request): Session | null {
    const raw = readCookie(req.headers.cookie, SESSION_COOKIE);
    if (!raw) return null;
    const [body, signature] = raw.split('.');
    if (!body || !signature) return null;

    const expected = Buffer.from(this.sign(body));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

    try {
      const session = JSON.parse(Buffer.from(body, 'base64url').toString()) as Session;
      return session.exp > Date.now() / 1000 ? session : null;
    } catch {
      return null;
    }
  }
}

function readCookie(header: string | undefined, name: string): string | null {
  for (const part of header?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
}
