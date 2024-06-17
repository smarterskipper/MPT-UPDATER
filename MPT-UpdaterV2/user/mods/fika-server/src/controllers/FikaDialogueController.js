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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FikaDialogueController = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ProfileHelper_1 = require("C:/snapshot/project/obj/helpers/ProfileHelper");
const BackendErrorCodes_1 = require("C:/snapshot/project/obj/models/enums/BackendErrorCodes");
const FikaFriendRequestsHelper_1 = require("../helpers/FikaFriendRequestsHelper");
const FikaPlayerRelationsHelper_1 = require("../helpers/FikaPlayerRelationsHelper");
let FikaDialogueController = class FikaDialogueController {
    dialogueChatBots;
    profileHelper;
    fikaFriendRequestsHelper;
    fikaPlayerRelationsHelper;
    constructor(dialogueChatBots, profileHelper, fikaFriendRequestsHelper, fikaPlayerRelationsHelper) {
        this.dialogueChatBots = dialogueChatBots;
        this.profileHelper = profileHelper;
        this.fikaFriendRequestsHelper = fikaFriendRequestsHelper;
        this.fikaPlayerRelationsHelper = fikaPlayerRelationsHelper;
        // empty
    }
    getFriendList(sessionID) {
        const botsAndFriends = this.dialogueChatBots.map((v) => v.getChatBot());
        const friendsIds = this.fikaPlayerRelationsHelper.getFriendsList(sessionID);
        for (const friendId of friendsIds) {
            const profile = this.profileHelper.getPmcProfile(friendId);
            botsAndFriends.push({
                _id: profile._id,
                aid: profile.aid,
                Info: {
                    Nickname: profile.Info.Nickname,
                    Level: profile.Info.Level,
                    Side: profile.Info.Side,
                    MemberCategory: profile.Info.MemberCategory,
                },
            });
        }
        return {
            Friends: botsAndFriends,
            Ignore: this.fikaPlayerRelationsHelper.getIgnoreList(sessionID),
            InIgnoreList: this.fikaPlayerRelationsHelper.getInIgnoreList(sessionID),
        };
    }
    listOutbox(sessionID) {
        const sentFriendRequests = this.fikaFriendRequestsHelper.getSentFriendRequests(sessionID);
        for (const sentFriendRequest of sentFriendRequests) {
            const profile = this.profileHelper.getPmcProfile(sentFriendRequest.to);
            sentFriendRequest.profile = {
                _id: profile._id,
                aid: profile.aid,
                Info: {
                    Nickname: profile.Info.Nickname,
                    Side: profile.Info.Side,
                    Level: profile.Info.Level,
                    MemberCategory: profile.Info.MemberCategory,
                },
            };
        }
        return sentFriendRequests;
    }
    listInbox(sessionID) {
        const receivedFriendRequests = this.fikaFriendRequestsHelper.getReceivedFriendRequests(sessionID);
        for (const receivedFriendRequest of receivedFriendRequests) {
            const profile = this.profileHelper.getPmcProfile(receivedFriendRequest.from);
            receivedFriendRequest.profile = {
                _id: profile._id,
                aid: profile.aid,
                Info: {
                    Nickname: profile.Info.Nickname,
                    Side: profile.Info.Side,
                    Level: profile.Info.Level,
                    MemberCategory: profile.Info.MemberCategory,
                },
            };
        }
        return receivedFriendRequests;
    }
    sendFriendRequest(from, to) {
        this.fikaFriendRequestsHelper.addFriendRequest(from, to);
        return {
            status: BackendErrorCodes_1.BackendErrorCodes.NONE,
            requestId: from,
            retryAfter: 0,
        };
    }
    acceptAllFriendRequests(sessionID) {
        const receivedFriendRequests = this.fikaFriendRequestsHelper.getReceivedFriendRequests(sessionID);
        for (const friendRequest of receivedFriendRequests) {
            this.acceptFriendRequest(friendRequest.from, friendRequest.to);
        }
    }
    acceptFriendRequest(from, to) {
        this.fikaFriendRequestsHelper.removeFriendRequest(from, to);
        this.fikaPlayerRelationsHelper.addFriend(from, to);
    }
    cancelFriendRequest(from, to) {
        this.fikaFriendRequestsHelper.removeFriendRequest(from, to);
    }
    declineFriendRequest(from, to) {
        this.cancelFriendRequest(from, to);
    }
    deleteFriend(fromId, friendId) {
        this.fikaPlayerRelationsHelper.removeFriend(fromId, friendId);
    }
    ignoreFriend(fromId, friendId) {
        this.fikaPlayerRelationsHelper.addToIgnoreList(fromId, friendId);
    }
    unIgnoreFriend(fromId, friendId) {
        this.fikaPlayerRelationsHelper.removeFromIgnoreList(fromId, friendId);
    }
};
exports.FikaDialogueController = FikaDialogueController;
exports.FikaDialogueController = FikaDialogueController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.injectAll)("DialogueChatBot")),
    __param(1, (0, tsyringe_1.inject)("ProfileHelper")),
    __param(2, (0, tsyringe_1.inject)("FikaFriendRequestsHelper")),
    __param(3, (0, tsyringe_1.inject)("FikaPlayerRelationsHelper")),
    __metadata("design:paramtypes", [Array, typeof (_a = typeof ProfileHelper_1.ProfileHelper !== "undefined" && ProfileHelper_1.ProfileHelper) === "function" ? _a : Object, typeof (_b = typeof FikaFriendRequestsHelper_1.FikaFriendRequestsHelper !== "undefined" && FikaFriendRequestsHelper_1.FikaFriendRequestsHelper) === "function" ? _b : Object, typeof (_c = typeof FikaPlayerRelationsHelper_1.FikaPlayerRelationsHelper !== "undefined" && FikaPlayerRelationsHelper_1.FikaPlayerRelationsHelper) === "function" ? _c : Object])
], FikaDialogueController);
//# sourceMappingURL=FikaDialogueController.js.map