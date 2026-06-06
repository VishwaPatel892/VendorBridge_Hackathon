"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignVendors = exports.close = exports.publish = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const rfq_service_1 = __importDefault(require("./rfq.service"));
const getAll = async (req, res, next) => {
    try {
        const rfqs = await rfq_service_1.default.getAll(req.query, req.user.userId, req.user.role);
        res.json({ success: true, data: rfqs });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const getById = async (req, res, next) => {
    try {
        const rfq = await rfq_service_1.default.getById(req.params.id);
        res.json({ success: true, data: rfq });
    }
    catch (error) {
        next(error);
    }
};
exports.getById = getById;
const create = async (req, res, next) => {
    try {
        const rfq = await rfq_service_1.default.create(req.body, req.user.userId);
        res.locals.createdId = rfq._id.toString();
        res.status(201).json({ success: true, data: rfq });
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const update = async (req, res, next) => {
    try {
        const rfq = await rfq_service_1.default.update(req.params.id, req.body, req.user.userId);
        res.json({ success: true, data: rfq });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const publish = async (req, res, next) => {
    try {
        const rfq = await rfq_service_1.default.publish(req.params.id);
        res.json({ success: true, data: rfq });
    }
    catch (error) {
        next(error);
    }
};
exports.publish = publish;
const close = async (req, res, next) => {
    try {
        const rfq = await rfq_service_1.default.close(req.params.id);
        res.json({ success: true, data: rfq });
    }
    catch (error) {
        next(error);
    }
};
exports.close = close;
const assignVendors = async (req, res, next) => {
    try {
        const rfq = await rfq_service_1.default.assignVendors(req.params.id, req.body.vendorIds);
        res.json({ success: true, data: rfq });
    }
    catch (error) {
        next(error);
    }
};
exports.assignVendors = assignVendors;
//# sourceMappingURL=rfq.controller.js.map