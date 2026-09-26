import { NfsAccountProvider } from './nfs-account.provider';
import { ConfigService } from '@nestjs/config';
export declare class PythonNfsAccountProvider implements NfsAccountProvider {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private runBridgeCommand;
    createAccount(data: {
        username: string;
        persona: string;
        password: string;
    }): Promise<void>;
    accountExists(username: string): Promise<boolean>;
    personaExists(persona: string): Promise<boolean>;
}
