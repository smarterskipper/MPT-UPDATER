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
exports.FikaItemEventRouter = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const Router_1 = require("C:/snapshot/project/obj/di/Router");
const FikaSendItemCallbacks_1 = require("../../callbacks/FikaSendItemCallbacks");
let FikaItemEventRouter = class FikaItemEventRouter extends Router_1.ItemEventRouterDefinition {
    fikaSendItemCallbacks;
    constructor(fikaSendItemCallbacks) {
        super();
        this.fikaSendItemCallbacks = fikaSendItemCallbacks;
    }
    getHandledRoutes() {
        return [new Router_1.HandledRoute("SendToPlayer", false)];
    }
    handleItemEvent(url, pmcData, body, sessionID) {
        switch (url) {
            case "SendToPlayer":
                return this.fikaSendItemCallbacks.handleSendItem(pmcData, body, sessionID);
        }
    }
};
exports.FikaItemEventRouter = FikaItemEventRouter;
exports.FikaItemEventRouter = FikaItemEventRouter = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("FikaSendItemCallbacks")),
    __metadata("design:paramtypes", [typeof (_a = typeof FikaSendItemCallbacks_1.FikaSendItemCallbacks !== "undefined" && FikaSendItemCallbacks_1.FikaSendItemCallbacks) === "function" ? _a : Object])
], FikaItemEventRouter);
//# sourceMappingURL=FikaItemEventRouter.js.map