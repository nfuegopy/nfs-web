"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NfsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nfs_service_1 = require("./nfs.service");
const mock_nfs_account_provider_1 = require("./mock-nfs-account.provider");
const python_nfs_account_provider_1 = require("./python-nfs-account.provider");
let NfsModule = class NfsModule {
};
exports.NfsModule = NfsModule;
exports.NfsModule = NfsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            nfs_service_1.NfsService,
            {
                provide: 'NfsAccountProvider',
                useFactory: (configService) => {
                    const provider = configService.get('NFS_PROVIDER');
                    if (provider === 'python') {
                        return new python_nfs_account_provider_1.PythonNfsAccountProvider(configService);
                    }
                    return new mock_nfs_account_provider_1.MockNfsAccountProvider();
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: ['NfsAccountProvider', nfs_service_1.NfsService],
    })
], NfsModule);
//# sourceMappingURL=nfs.module.js.map