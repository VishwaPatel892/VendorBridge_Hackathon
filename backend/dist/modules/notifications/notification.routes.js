"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_model_1 = __importDefault(require("./notification.model"));
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const constants_1 = require("../../config/constants");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.default);
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || constants_1.PAGINATION.DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || constants_1.PAGINATION.DEFAULT_LIMIT;
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            notification_model_1.default.find({ userId: req.user.userId })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit),
            notification_model_1.default.countDocuments({ userId: req.user.userId }),
        ]);
        res.json({
            success: true,
            data: notifications,
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
router.put('/read-all', async (req, res, next) => {
    try {
        await notification_model_1.default.updateMany({ userId: req.user.userId, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id/read', async (req, res, next) => {
    try {
        const notif = await notification_model_1.default.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.json({ success: true, data: notif });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map