export interface NfsAccountProvider {
    createAccount(data: {
        username: string;
        persona: string;
        password: string;
    }): Promise<void>;
    accountExists(username: string): Promise<boolean>;
    personaExists(persona: string): Promise<boolean>;
}
