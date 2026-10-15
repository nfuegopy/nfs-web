import { Body, Controller, Get, HttpCode, Inject, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { MailService } from '../mail/mail.service';
import { NFS_GATEWAY, NfsError, type NfsGateway } from '../nfs/nfs-gateway';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, ResetPasswordDto } from './dto';
import { CurrentSession, SessionGuard } from './session.guard';
import { type Session, SessionService } from './session.service';

const RESET_TTL_SECONDS = 30 * 60;

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly frontendUrl: string;

  constructor(
    @Inject(NFS_GATEWAY) private readonly nfs: NfsGateway,
    private readonly sessions: SessionService,
    private readonly mail: MailService,
    config: ConfigService,
  ) {
    this.frontendUrl = config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const account = await this.nfs.authenticate(dto.username, dto.password);
    this.sessions.issue(res, account);
    return { account };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    this.sessions.clear(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentSession() session: Session) {
    return { account: { username: session.username, persona: session.persona } };
  }

  @Post('password')
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async changePassword(@CurrentSession() session: Session, @Body() dto: ChangePasswordDto) {
    await this.nfs.changePassword(session.username, dto.currentPassword, dto.newPassword);
    return { success: true, message: 'Contraseña actualizada. Usala también para entrar al juego' };
  }

  /** Siempre responde lo mismo para no revelar qué emails están registrados. */
  @Post('password/forgot')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    if (!this.mail.enabled) {
      throw new NfsError('MAIL_DISABLED', 'La recuperación por email no está disponible por ahora. Escribile al administrador');
    }
    const target = await this.nfs.passwordResetTarget(dto.email);
    if (target) {
      const token = this.sessions.createToken('reset', { u: target.username, fp: target.fingerprint }, RESET_TTL_SECONDS);
      const link = `${this.frontendUrl}/restablecer?token=${encodeURIComponent(token)}`;
      await this.mail.send(
        dto.email,
        'Restablecé tu contraseña de NFSU2 Online',
        `Hola ${target.username}:\n\nPara elegir una contraseña nueva entrá a este enlace (vence en 30 minutos):\n${link}\n\nSi no lo pediste, ignorá este email: tu contraseña no cambia.\n\nNFSU2 Online`,
        resetEmailHtml(target.username, link),
      );
      this.logger.log(`Enlace de recuperación enviado a la cuenta ${target.username}`);
    }
    return { success: true, message: 'Si ese email está registrado, te enviamos un enlace para restablecer la contraseña' };
  }

  @Post('password/reset')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const data = this.sessions.verifyToken<{ u: string; fp: string }>('reset', dto.token);
    if (!data || typeof data.u !== 'string' || typeof data.fp !== 'string') {
      throw new NfsError('INVALID_RESET_TOKEN', 'El enlace ya se usó o venció. Pedí uno nuevo');
    }
    await this.nfs.resetPassword(data.u, data.fp, dto.newPassword);
    return { success: true, message: 'Listo, ya podés ingresar con tu contraseña nueva' };
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function resetEmailHtml(username: string, link: string) {
  const safeLink = escapeHtml(link);
  return `<!doctype html><html><body style="margin:0;background:#0b0d0c;font-family:Arial,sans-serif;color:#eef2ef">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <p style="color:#7dff3a;font-weight:bold;letter-spacing:2px;margin:0 0 16px">NFSU2 ONLINE</p>
    <p>Hola <strong>${escapeHtml(username)}</strong>:</p>
    <p>Para elegir una contraseña nueva tocá el botón. El enlace vence en 30 minutos.</p>
    <p style="margin:28px 0"><a href="${safeLink}" style="background:#7dff3a;color:#0b1406;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Restablecer contraseña</a></p>
    <p style="color:#9aa69f;font-size:13px">Si no lo pediste, ignorá este email: tu contraseña no cambia.</p>
  </div></body></html>`;
}
