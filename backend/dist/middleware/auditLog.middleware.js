"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auditLog_model_1 = __importDefault(require("../modules/audit-logs/auditLog.model"));
const logAction = (config) => {
    return async (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const entityId = config.getEntityId?.(req, res) ||
                    res.locals.createdId ||
                    req.params.id ||
                    body?._id ||
                    body?.data?._id;
                setImmediate(async () => {
                    try {
                        await auditLog_model_1.default.create({
                            userId: req.user.userId,
                            action: config.action,
                            entityType: config.entityType,
                            entityId,
                            changes: req.method !== 'GET' ? { body: req.body } : undefined,
                            ipAddress: req.ip || req.socket.remoteAddress,
                            userAgent: req.headers['user-agent'],
                        });
                    }
                    catch (error) {
                        console.error('Audit log error:', error);
                    }
                });
            }
            return originalJson(body);
        };
        next();
    };
};
exports.default = logAction;
//# sourceMappingURL=auditLog.middleware.js.map