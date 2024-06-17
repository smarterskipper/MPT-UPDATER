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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fika = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const DatabaseServer_1 = require("C:/snapshot/project/obj/servers/DatabaseServer");
const Overrider_1 = require("./overrides/Overrider");
let Fika = class Fika {
    databaseServer;
    overrider;
    constructor(databaseServer, overrider) {
        this.databaseServer = databaseServer;
        this.overrider = overrider;
        // empty
    }
    async preAkiLoad(container) {
        await this.overrider.override(container);
    }
};
exports.Fika = Fika;
exports.Fika = Fika = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("DatabaseServer")),
    __param(1, (0, tsyringe_1.inject)("Overrider")),
    __metadata("design:paramtypes", [typeof (_a = typeof DatabaseServer_1.DatabaseServer !== "undefined" && DatabaseServer_1.DatabaseServer) === "function" ? _a : Object, typeof (_b = typeof Overrider_1.Overrider !== "undefined" && Overrider_1.Overrider) === "function" ? _b : Object])
], Fika);
//# sourceMappingURL=Fika.js.map