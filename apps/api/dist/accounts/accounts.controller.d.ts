import { CreateAccountDto } from './dto/create-account.dto';
import type { NfsAccountProvider } from '../nfs/nfs-account.provider';
export declare class AccountsController {
    private readonly nfsProvider;
    constructor(nfsProvider: NfsAccountProvider);
    create(createAccountDto: CreateAccountDto): Promise<{
        success: boolean;
        message: string;
        account: {
            username: string;
            persona: string;
        };
    }>;
}
