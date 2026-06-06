"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reject = exports.approve = exports.getById = exports.getAll = exports.initiate = void 0;
const approval_service_1 = __importDefault(require("./approval.service"));
const initiate = async (req, res, next) => {
    try {
        const approval = await approval_service_1.default.initiate(req.body, req.user.userId);
        res.locals.createdId = approval._id.toString();
        res.status(201).json({ success: true, data: approval });
    }
    catch (error) {
        next(error);
    }
};
exports.initiate = initiate;
const getAll = async (req, res, next) => {
    try {
        const approvals = await approval_service_1.default.getAll(req.query, req.user.userId, req.user.role);
        res.json({ success: true, data: approvals });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const getById = async (req, res, next) => {
    try {
        const approval = await approval_service_1.default.getById(req.params.id);
        res.json({ success: true, data: approval });
    }
    catch (error) {
        next(error);
    }
};
exports.getById = getById;
const approve = async (req, res, next) => {
    try {
        const approval = await approval_service_1.default.approve(req.params.id, req.user.userId, req.body.remarks);
        res.json({ success: true, data: approval });
    }
    catch (error) {
        next(error);
    }
};
exports.approve = approve;
const reject = async (req, res, next) => {
    try {
        const approval = await approval_service_1.default.reject(req.params.id, req.user.userId, req.body.remarks);
        res.json({ success: true, data: approval });
    }
    catch (error) {
        next(error);
    }
};
exports.reject = reject;
//# sourceMappingURL=approval.controller.js.map