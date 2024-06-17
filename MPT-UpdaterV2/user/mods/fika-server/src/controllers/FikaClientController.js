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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FikaClientController = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const FikaConfig_1 = require("../utils/FikaConfig");
let FikaClientController = class FikaClientController {
    fikaConfig;
    constructor(fikaConfig) {
        this.fikaConfig = fikaConfig;
        // empty
    }
    /**
     * Handle /fika/client/config
     */
    handleClientConfig() {
        return this.fikaConfig.getConfig().client;
    }
};
exports.FikaClientController = FikaClientController;
exports.FikaClientController = FikaClientController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("FikaConfig")),
    __metadata("design:paramtypes", [typeof (_a = typeof FikaConfig_1.FikaConfig !== "undefined" && FikaConfig_1.FikaConfig) === "function" ? _a : Object])
], FikaClientController);
//# sourceMappingURL=FikaClientController.js.map