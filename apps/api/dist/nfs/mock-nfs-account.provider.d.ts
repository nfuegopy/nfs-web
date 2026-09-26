import { NfsAccountProvider } from './nfs-account.provider';
export declare class MockNfsAccountProvider implements NfsAccountProvider {
    private accounts;
    private personas;
    createAccount(data: {
        username: string;
        persona: string;
        password: string;
    }): Promise<void>;
    accountExists(username: string): Promise<boolean>;
    personaExists(persona: string): Promise<boolean>;
}
