"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UIFixes {
    databaseServer;
    logger;
    preAkiLoad(container) {
        this.databaseServer = container.resolve("DatabaseServer");
        this.logger = container.resolve("WinstonLogger");
        const profileHelper = container.resolve("ProfileHelper");
        const staticRouterModService = container.resolve("StaticRouterModService");
        // Handle scav profile for post-raid scav transfer swaps (fixed in 3.9.0)
        container.afterResolution("InventoryController", (_, inventoryController) => {
            const original = inventoryController.swapItem;
            inventoryController.swapItem = (pmcData, request, sessionID) => {
                let playerData = pmcData;
                if (request.fromOwner?.type === "Profile" && request.fromOwner.id !== playerData._id) {
                    playerData = profileHelper.getScavProfile(sessionID);
                }
                return original.call(inventoryController, playerData, request, sessionID);
            };
        }, { frequency: "Always" });
        staticRouterModService.registerStaticRouter("UIFixesRoutes", [
            {
                url: "/uifixes/assortUnlocks",
                action: (url, info, sessionId, output) => {
                    return JSON.stringify(this.loadAssortmentUnlocks());
                }
            }
        ], "custom-static-ui-fixes");
    }
    loadAssortmentUnlocks() {
        const traders = this.databaseServer.getTables().traders;
        const quests = this.databaseServer.getTables().templates.quests;
        const result = {};
        for (const traderId in traders) {
            const trader = traders[traderId];
            if (trader.questassort) {
                for (const questStatus in trader.questassort) {
                    // Explicitly check that quest status is an expected value - some mods accidently import in such a way that adds a "default" value
                    if (!["started", "success", "fail"].includes(questStatus)) {
                        continue;
                    }
                    for (const assortId in trader.questassort[questStatus]) {
                        const questId = trader.questassort[questStatus][assortId];
                        if (!quests[questId]) {
                            this.logger.error(`Trader ${traderId} questassort references unknown quest ${JSON.stringify(questId)}!`);
                            continue;
                        }
                        result[assortId] = quests[questId].name;
                    }
                }
            }
        }
        return result;
    }
}
module.exports = { mod: new UIFixes() };
//# sourceMappingURL=mod.js.map