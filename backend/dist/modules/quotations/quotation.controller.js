"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.update = exports.getById = exports.editByBody = exports.getByRFQ = exports.getAll = exports.submit = void 0;
const quotation_service_1 = __importDefault(require("./quotation.service"));
const submit = async (req, res, next) => {
    try {
        const quotation = await quotation_service_1.default.submit(req.body, req.user.userId);
        res.locals.createdId = quotation._id.toString();
        res.status(201).json({ success: true, data: quotation });
    }
    catch (error) {
        next(error);
    }
};
exports.submit = submit;
const getAll = async (req, res, next) => {
    try {
        if (req.query.rfqId) {
            const quotations = await quotation_service_1.default.getByRFQ(req.query.rfqId);
            res.json({ success: true, data: quotations });
            return;
        }
        const Quotation = (await Promise.resolve().then(() => __importStar(require('./quotation.model')))).default;
        const quotations = await Quotation.find({})
            .populate('vendorId', 'companyName email')
            .populate('rfqId', 'title rfqNumber')
            .sort('-submittedAt');
        res.json({ success: true, data: quotations });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const getByRFQ = async (req, res, next) => {
    try {
        const quotations = await quotation_service_1.default.getByRFQ(req.params.rfqId);
        res.json({ success: true, data: quotations });
    }
    catch (error) {
        next(error);
    }
};
exports.getByRFQ = getByRFQ;
const editByBody = async (req, res, next) => {
    try {
        const quotation = await quotation_service_1.default.update(req.body.id || req.body._id, req.body, req.user.userId);
        res.json({ success: true, data: quotation });
    }
    catch (error) {
        next(error);
    }
};
exports.editByBody = editByBody;
const getById = async (req, res, next) => {
    try {
        const quotation = await quotation_service_1.default.getById(req.params.id);
        res.json({ success: true, data: quotation });
    }
    catch (error) {
        next(error);
    }
};
exports.getById = getById;
const update = async (req, res, next) => {
    try {
        const quotation = await quotation_service_1.default.update(req.params.id, req.body, req.user.userId);
        res.json({ success: true, data: quotation });
    }
    catch (error) {
        next(error);
    }
};
exports.update = update;
const compare = async (req, res, next) => {
    try {
        const data = await quotation_service_1.default.compareByRFQ(req.params.rfqId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.compare = compare;
//# sourceMappingURL=quotation.controller.js.map