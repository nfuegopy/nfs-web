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

/**
 * Tokens firmados con HMAC-SHA256. Se usan para la cookie de sesión (httpOnly) y para los enlaces
 * de recuperación de contraseña. Cada token lleva un "propósito" para que no se puedan intercambiar.
 */
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

  createToken(purpose: string, data: Record<string, unknown>, ttlSeconds: number) {
    const body = Buffer.from(JSON.stringify({ ...data, purpose, exp: Math.floor(Date.now() / 1000) + ttlSeconds })).toString('base64url');
    return `${body}.${this.sign(body)}`;
  }

  verifyToken<T>(purpose: string, token: unknown): (T & { exp: number }) | null {
    if (typeof token !== 'string' || token.length > 2048) return null;
    const [body, signature, extra] = token.split('.');
    if (!body || !signature || extra !== undefined) return null;

    const expected = Buffer.from(this.sign(body));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

    try {
      const data = JSON.parse(Buffer.from(body, 'base64url').toString());
      if (data.purpose !== purpose || typeof data.exp !== 'number' || data.exp <= Date.now() / 1000) return null;
      return data;
    } catch {
      return null;
    }
  }

  issue(res: Response, account: { username: string; persona: string }) {
    const token = this.createToken('session', { username: account.username, persona: account.persona }, SESSION_TTL_SECONDS);
    res.cookie(SESSION_COOKIE, token, {
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
    return this.verifyToken<Session>('session', readCookie(req.headers.cookie, SESSION_COOKIE));
  }
}

function readCookie(header: string | undefined, name: string): string | null {
  for (const part of header?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) {
      try {
        return decodeURIComponent(value.join('='));
      } catch {
        return null;
      }
    }
  }
  return null;
}
