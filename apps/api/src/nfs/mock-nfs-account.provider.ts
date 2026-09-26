import { Injectable } from '@nestjs/common';
import { NfsAccountProvider } from './nfs-account.provider';

@Injectable()
export class MockNfsAccountProvider implements NfsAccountProvider {
  private accounts = new Set<string>();
  private personas = new Set<string>();

  async createAccount(data: {
    username: string;
    persona: string;
    password: string;
  }): Promise<void> {
    if (this.accounts.has(data.username)) {
      throw new Error('Account already exists');
    }
    if (this.personas.has(data.persona)) {
      throw new Error('Persona already exists');
    }
    this.accounts.add(data.username);
    this.personas.add(data.persona);
  }

  async accountExists(username: string): Promise<boolean> {
    return this.accounts.has(username);
  }

  async personaExists(persona: string): Promise<boolean> {
    return this.personas.has(persona);
  }
}
