import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

/** Envío de correos por SMTP (buzón de Hostinger). Sin configuración, las funciones de email quedan desactivadas. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    const port = Number(config.get<string>('SMTP_PORT') || 465);
    this.from = config.get<string>('MAIL_FROM') || `NFSU2 Online <${user}>`;
    this.transporter =
      host && user && pass ? createTransport({ host, port, secure: port === 465, auth: { user, pass } }) : null;
  }

  get enabled() {
    return this.transporter !== null;
  }

  async send(to: string, subject: string, text: string, html: string) {
    if (!this.transporter) {
      throw new ServiceUnavailableException({ code: 'MAIL_DISABLED', message: 'El envío de emails no está disponible por ahora' });
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text, html });
    } catch (error) {
      this.logger.error(`No se pudo enviar el email: ${(error as Error).message}`);
      throw new ServiceUnavailableException({ code: 'MAIL_FAILED', message: 'No pudimos enviar el email. Probá de nuevo en unos minutos' });
    }
  }
}
