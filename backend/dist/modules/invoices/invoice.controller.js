"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.pay = exports.sendEmail = exports.getPDF = exports.getById = exports.getAll = exports.generate = void 0;
const invoice_service_1 = __importDefault(require("./invoice.service"));
const generate = async (req, res, next) => {
    try {
        const invoice = await invoice_service_1.default.generate(req.params.poId, req.user.userId);
        res.locals.createdId = invoice._id.toString();
        res.status(201).json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.generate = generate;
const getAll = async (req, res, next) => {
    try {
        const invoices = await invoice_service_1.default.getAll(req.query, req.user.userId, req.user.role);
        res.json({ success: true, data: invoices });
    }
    catch (error) {
        next(error);
    }
};
exports.getAll = getAll;
const getById = async (req, res, next) => {
    try {
        const invoice = await invoice_service_1.default.getById(req.params.id);
        res.json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.getById = getById;
const getPDF = async (req, res, next) => {
    try {
        const pdfBuffer = await invoice_service_1.default.getPDF(req.params.id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
        res.send(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
};
exports.getPDF = getPDF;
const sendEmail = async (req, res, next) => {
    try {
        const invoice = await invoice_service_1.default.sendEmail(req.params.id, req.body);
        res.json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.sendEmail = sendEmail;
const pay = async (req, res, next) => {
    try {
        const invoice = await invoice_service_1.default.updateStatus(req.params.id, 'paid');
        res.json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.pay = pay;
const updateStatus = async (req, res, next) => {
    try {
        const invoice = await invoice_service_1.default.updateStatus(req.params.id, req.body.status);
        res.json({ success: true, data: invoice });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStatus = updateStatus;
//# sourceMappingURL=invoice.controller.js.map