"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockNfsAccountProvider = void 0;
const common_1 = require("@nestjs/common");
let MockNfsAccountProvider = class MockNfsAccountProvider {
    accounts = new Set();
    personas = new Set();
    async createAccount(data) {
        if (this.accounts.has(data.username)) {
            throw new Error('Account already exists');
        }
        if (this.personas.has(data.persona)) {
            throw new Error('Persona already exists');
        }
        this.accounts.add(data.username);
        this.personas.add(data.persona);
    }
    async accountExists(username) {
        return this.accounts.has(username);
    }
    async personaExists(persona) {
        return this.personas.has(persona);
    }
};
exports.MockNfsAccountProvider = MockNfsAccountProvider;
exports.MockNfsAccountProvider = MockNfsAccountProvider = __decorate([
    (0, common_1.Injectable)()
], MockNfsAccountProvider);
//# sourceMappingURL=mock-nfs-account.provider.js.map