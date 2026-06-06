"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getById = exports.getAll = exports.generate = void 0;
const po_service_1 = __importDefault(require("./po.service"));
const generate = async (req, res, next) => {
    try {
        const quotationId = req.body.quotationId || req.params.approvalId;
        const po = await po_service_1.default.generate(quotationId, req.user.userId, !!req.body.quotationId);
        res.locals.createdId = po._id.toString();
        res.status(201).json({ success: true, data: po });
    }
    catch (error) {
        next(error);
    }
};
exports.generate = generate;
const getAll = async (req, res, next) => {
    try {
        const pos = await po_service_1.default.getAll(req.query, req.user.userId, req.user.role);
        res.json({ success: true, data: pos });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const getById = async (req, res, next) => {
    try {
        const po = await po_service_1.default.getById(req.params.id);
        res.json({ success: true, data: po });
    }
    catch (error) {
        next(error);
    }
};
exports.getById = getById;
const updateStatus = async (req, res, next) => {
    try {
        const po = await po_service_1.default.updateStatus(req.params.id, req.body.status);
        res.json({ success: true, data: po });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
//# sourceMappingURL=po.controller.js.map