import { createHash } from 'crypto';
import { NfsError, NfsGateway } from './nfs-gateway';

interface MockAccount {
  username: string;
  persona: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

const hash = (password: string) => createHash('sha256').update(password).digest('hex');

/** Sólo para desarrollo local: guarda cuentas en memoria y nunca toca el servidor real. */
export class MockNfsGateway implements NfsGateway {
  private readonly accounts = new Map<string, MockAccount>();

  createAccount(data: { username: string; persona: string; email: string; password: string }) {
    const list = [...this.accounts.values()];
    if (this.accounts.has(data.username.toLowerCase())) throw new NfsError('ACCOUNT_EXISTS', 'Ese nombre de usuario ya está en uso');
    if (list.some((a) => a.persona.toLowerCase() === data.persona.toLowerCase()))
      throw new NfsError('PERSONA_EXISTS', 'Ese nombre de piloto ya está en uso');
    if (list.some((a) => a.email.toLowerCase() === data.email.toLowerCase()))
      throw new NfsError('EMAIL_EXISTS', 'Ese email ya está registrado');

    this.accounts.set(data.username.toLowerCase(), {
      username: data.username,
      persona: data.persona,
      email: data.email,
      passwordHash: hash(data.password),
      createdAt: Date.now() / 1000,
    });
    return Promise.resolve({ username: data.username, persona: data.persona });
  }

  authenticate(username: string, password: string) {
    const account = this.accounts.get(username.toLowerCase());
    if (!account || account.passwordHash !== hash(password))
      throw new NfsError('INVALID_CREDENTIALS', 'Usuario o contraseña incorrectos');
    return Promise.resolve({ username: account.username, persona: account.persona });
  }

  changePassword(username: string, currentPassword: string, newPassword: string) {
    const account = this.accounts.get(username.toLowerCase());
    if (!account || account.passwordHash !== hash(currentPassword))
      throw new NfsError('WRONG_PASSWORD', 'La contraseña actual no es correcta');
    account.passwordHash = hash(newPassword);
    return Promise.resolve();
  }

  passwordResetTarget(email: string) {
    const account = [...this.accounts.values()].find((a) => a.email.toLowerCase() === email.toLowerCase());
    return Promise.resolve(account ? { username: account.username, fingerprint: account.passwordHash.slice(0, 32) } : null);
  }

  resetPassword(username: string, fingerprint: string, newPassword: string) {
    const account = this.accounts.get(username.toLowerCase());
    if (!account || account.passwordHash.slice(0, 32) !== fingerprint)
      throw new NfsError('INVALID_RESET_TOKEN', 'El enlace ya se usó o venció. Pedí uno nuevo');
    account.passwordHash = hash(newPassword);
    return Promise.resolve();
  }

  getProfile(username: string) {
    const account = this.accounts.get(username.toLowerCase());
    if (!account) throw new NfsError('ACCOUNT_NOT_FOUND', 'La cuenta no existe');
    return Promise.resolve({
      account: { username: account.username, email: account.email, createdAt: account.createdAt, online: null },
      personas: [{ name: account.persona, primary: true, createdAt: account.createdAt }],
      stats: [
        { persona: account.persona, game: 'Underground 2', category: 'Circuito', wins: 3, losses: 1, disconnects: 0, skill: 210, rank: 0 },
        { persona: account.persona, game: 'Underground 2', category: 'Drift', wins: 0, losses: 2, disconnects: 1, skill: 95, rank: 0 },
      ],
      races: [
        { persona: account.persona, game: 'Underground 2', category: 'Circuito', track: '4014', laps: 3, ranked: true, outcome: 'WIN', place: 1, timeMs: 215400, bestLapMs: 70120, bestDrift: 0, disconnected: false, date: Date.now() / 1000 },
      ],
    });
  }

  leaderboard(_game: string, category: number) {
    const categories = ['Circuito', 'Sprint', 'Drag', 'Drift', 'Street X', 'URL'];
    return Promise.resolve({
      game: 'Underground 2',
      category: categories[category] ?? `Categoría ${category}`,
      categories: categories.map((name, id) => ({ id, name })),
      rows: [...this.accounts.values()].map((a, i) => ({ position: i + 1, persona: a.persona, wins: 1, losses: 0, skill: 200 })),
    });
  }

  summary() {
    return Promise.resolve({ players: this.accounts.size, online: 0, races: 0 });
  }
}
