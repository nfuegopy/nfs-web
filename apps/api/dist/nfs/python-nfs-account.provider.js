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
var PythonNfsAccountProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonNfsAccountProvider = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const config_1 = require("@nestjs/config");
let PythonNfsAccountProvider = PythonNfsAccountProvider_1 = class PythonNfsAccountProvider {
    configService;
    logger = new common_1.Logger(PythonNfsAccountProvider_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async runBridgeCommand(action, data) {
        const pythonBin = this.configService.get('NFS_PYTHON_BIN') || 'python3';
        const bridgePath = this.configService.get('NFS_BRIDGE_PATH');
        if (!bridgePath) {
            this.logger.error('NFS_BRIDGE_PATH no está configurado');
            throw new common_1.InternalServerErrorException('NFS_SERVER_ERROR');
        }
        return new Promise((resolve, reject) => {
            const child = (0, child_process_1.spawn)(pythonBin, [bridgePath]);
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (chunk) => {
                stdout += chunk.toString();
            });
            child.stderr.on('data', (chunk) => {
                stderr += chunk.toString();
                this.logger.warn(`Bridge stderr: ${chunk.toString().trim()}`);
            });
            child.on('close', (code) => {
                try {
                    if (!stdout.trim()) {
                        throw new Error('Respuesta vacía del bridge');
                    }
                    const result = JSON.parse(stdout);
                    resolve(result);
                }
                catch (error) {
                    this.logger.error('Fallo al parsear la salida del bridge:', stdout);
                    reject(new common_1.InternalServerErrorException('NFS_SERVER_ERROR'));
                }
            });
            child.on('error', (error) => {
                this.logger.error('Fallo al ejecutar el bridge:', error);
                reject(new common_1.InternalServerErrorException('NFS_SERVER_ERROR'));
            });
            const payload = { action, ...data };
            child.stdin.write(JSON.stringify(payload));
            child.stdin.end();
        });
    }
    async createAccount(data) {
        const result = await this.runBridgeCommand('createAccount', data);
        if (result.success === false) {
            const code = result.code || result.error;
            switch (code) {
                case 'ACCOUNT_EXISTS':
                    throw new common_1.ConflictException('La cuenta ya existe');
                case 'PERSONA_EXISTS':
                    throw new common_1.ConflictException('El nombre de jugador ya existe');
                case 'INVALID_USERNAME':
                    throw new common_1.BadRequestException('Nombre de usuario inválido');
                case 'INVALID_PERSONA':
                    throw new common_1.BadRequestException('Nombre de jugador inválido');
                case 'INVALID_PASSWORD':
                    throw new common_1.BadRequestException('Contraseña inválida');
                case 'INVALID_JSON':
                    throw new common_1.InternalServerErrorException('Error interno: JSON inválido');
                case 'NFS_SERVER_ERROR':
                default:
                    throw new common_1.InternalServerErrorException('Error interno del servidor NFS');
            }
        }
    }
    async accountExists(username) {
        try {
            const result = await this.runBridgeCommand('checkAccount', { username });
            return result.exists === true;
        }
        catch {
            return false;
        }
    }
    async personaExists(persona) {
        try {
            const result = await this.runBridgeCommand('checkPersona', { persona });
            return result.exists === true;
        }
        catch {
            return false;
        }
    }
};
exports.PythonNfsAccountProvider = PythonNfsAccountProvider;
exports.PythonNfsAccountProvider = PythonNfsAccountProvider = PythonNfsAccountProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PythonNfsAccountProvider);
//# sourceMappingURL=python-nfs-account.provider.js.map