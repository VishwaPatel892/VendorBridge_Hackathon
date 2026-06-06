"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformance = exports.remove = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const vendor_service_1 = __importDefault(require("./vendor.service"));
const getAll = async (req, res, next) => {
    try {
        const vendors = await vendor_service_1.default.getAll(req.query);
        res.json({ success: true, data: vendors });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const getById = async (req, res, next) => {
    try {
        const vendor = await vendor_service_1.default.getById(req.params.id);
        res.json({ success: true, data: vendor });
    }
    catch (error) {
        next(error);
    }
};
exports.getById = getById;
const create = async (req, res, next) => {
    try {
        const vendor = await vendor_service_1.default.create(req.body, req.user.userId);
        res.locals.createdId = vendor._id.toString();
        res.status(201).json({ success: true, data: vendor });
    }
    catch (error) {
        next(error);
    }
};
exports.create = create;
const update = async (req, res, next) => {
    try {
        const vendor = await vendor_service_1.default.update(req.params.id, req.body);
        res.json({ success: true, data: vendor });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const remove = async (req, res, next) => {
    try {
        const vendor = await vendor_service_1.default.remove(req.params.id);
        res.json({ success: true, data: vendor });
    }
    catch (error) {
        next(error);
    }
};
exports.remove = remove;
const getPerformance = async (req, res, next) => {
    try {
        const performance = await vendor_service_1.default.getPerformance(req.params.id);
        res.json({ success: true, data: performance });
    }
    catch (error) {
        next(error);
    }
};
exports.getPerformance = getPerformance;
//# sourceMappingURL=vendor.controller.js.map