"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_model_1 = __importDefault(require("./notification.model"));
const createNotification = async (params) => {
    try {
        await notification_model_1.default.create({
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            entityId: params.entityId,
            entityType: params.entityType,
        });
    }
    catch (error) {
        console.error('Failed to create notification:', error);
    }
};
exports.default = createNotification;
//# sourceMappingURL=notification.service.js.map