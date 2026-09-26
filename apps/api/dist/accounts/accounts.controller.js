"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsController = void 0;
const common_1 = require("@nestjs/common");
const create_account_dto_1 = require("./dto/create-account.dto");
let AccountsController = class AccountsController {
    nfsProvider;
    constructor(nfsProvider) {
        this.nfsProvider = nfsProvider;
    }
    async create(createAccountDto) {
        if (createAccountDto.password !== createAccountDto.password) {
        }
        try {
            const accountExists = await this.nfsProvider.accountExists(createAccountDto.username);
            if (accountExists) {
                throw new common_1.BadRequestException('El nombre de usuario ya está en uso');
            }
            const personaExists = await this.nfsProvider.personaExists(createAccountDto.persona);
            if (personaExists) {
                throw new common_1.BadRequestException('El nombre de jugador ya está en uso');
            }
            await this.nfsProvider.createAccount({
                username: createAccountDto.username,
                persona: createAccountDto.persona,
                password: createAccountDto.password,
            });
            return {
                success: true,
                message: 'Cuenta creada correctamente',
                account: {
                    username: createAccountDto.username,
                    persona: createAccountDto.persona,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Error al crear la cuenta');
        }
    }
};
exports.AccountsController = AccountsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_account_dto_1.CreateAccountDto]),
    __metadata("design:returntype", Promise)
], AccountsController.prototype, "create", null);
exports.AccountsController = AccountsController = __decorate([
    (0, common_1.Controller)('accounts'),
    __param(0, (0, common_1.Inject)('NfsAccountProvider')),
    __metadata("design:paramtypes", [Object])
], AccountsController);
//# sourceMappingURL=accounts.controller.js.map