"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLog_model_1 = __importDefault(require("./auditLog.model"));
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = __importDefault(require("../../middleware/role.middleware"));
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.default);
router.use((0, role_middleware_1.default)('Admin'));
router.get('/', async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.userId)
            filter.userId = req.query.userId;
        if (req.query.entityType)
            filter.entityType = req.query.entityType;
        if (req.query.startDate || req.query.endDate) {
            filter.timestamp = {};
            if (req.query.startDate)
                filter.timestamp.$gte = new Date(req.query.startDate);
            if (req.query.endDate)
                filter.timestamp.$lte = new Date(req.query.endDate);
        }
        const page = parseInt(req.query.page) || constants_1.PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || constants_1.PAGINATION.DEFAULT_LIMIT;
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            auditLog_model_1.default.find(filter)
                .populate('userId', 'name email role')
                .sort('-timestamp')
                .skip(skip)
                .limit(limit),
            auditLog_model_1.default.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auditLog.routes.js.map