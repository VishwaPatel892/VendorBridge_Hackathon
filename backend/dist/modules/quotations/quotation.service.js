"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const quotation_model_1 = __importDefault(require("./quotation.model"));
const rfq_model_1 = __importDefault(require("../rfq/rfq.model"));
const vendor_model_1 = __importDefault(require("../vendors/vendor.model"));
const errorHandler_1 = require("../../middleware/errorHandler");
const constants_1 = require("../../config/constants");
const submit = async (data, userId) => {
    const rfq = await rfq_model_1.default.findById(data.rfqId);
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    if (rfq.status !== 'open')
        throw new errorHandler_1.AppError('RFQ is not open for submissions', 400);
    if (new Date() > new Date(rfq.deadline))
        throw new errorHandler_1.AppError('RFQ deadline has passed', 400);
    const vendor = await vendor_model_1.default.findOne({ userId });
    if (!vendor)
        throw new errorHandler_1.AppError('Vendor profile not found', 404);
    const isAssigned = rfq.assignedVendors.some((av) => av.vendorId.toString() === vendor._id.toString());
    if (!isAssigned)
        throw new errorHandler_1.AppError('You are not assigned to this RFQ', 403);
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * constants_1.GST_RATE;
    const grandTotal = subtotal + taxAmount;
    const existing = await quotation_model_1.default.findOne({ rfqId: data.rfqId, vendorId: vendor._id });
    if (existing) {
        Object.assign(existing, {
            lineItems: data.lineItems,
            deliveryTimeline: data.deliveryTimeline,
            notes: data.notes,
            attachments: data.attachments || [],
            subtotal,
            taxAmount,
            grandTotal,
            status: 'submitted',
        });
        return existing.save();
    }
    return quotation_model_1.default.create({
        rfqId: data.rfqId,
        vendorId: vendor._id,
        lineItems: data.lineItems,
        deliveryTimeline: data.deliveryTimeline,
        notes: data.notes,
        attachments: data.attachments || [],
        subtotal,
        taxAmount,
        grandTotal,
    });
};
const getByRFQ = async (rfqId) => {
    return quotation_model_1.default.find({ rfqId })
        .populate('vendorId', 'companyName email rating')
        .sort('-submittedAt');
};
const getById = async (id) => {
    const quotation = await quotation_model_1.default.findById(id)
        .populate('vendorId', 'companyName email contactPerson rating')
        .populate('rfqId', 'title rfqNumber');
    if (!quotation)
        throw new errorHandler_1.NotFoundError('Quotation');
    return quotation;
};
const update = async (id, data, userId) => {
    const quotation = await quotation_model_1.default.findById(id);
    if (!quotation)
        throw new errorHandler_1.NotFoundError('Quotation');
    if (quotation.status !== 'submitted')
        throw new errorHandler_1.AppError('Can only edit submitted quotations', 400);
    const vendor = await vendor_model_1.default.findOne({ userId });
    if (!vendor || quotation.vendorId.toString() !== vendor._id.toString()) {
        throw new errorHandler_1.AppError('Not authorized to edit this quotation', 403);
    }
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * constants_1.GST_RATE;
    const grandTotal = subtotal + taxAmount;
    Object.assign(quotation, {
        ...data,
        subtotal,
        taxAmount,
        grandTotal,
    });
    return quotation.save();
};
const compareByRFQ = async (rfqId) => {
    const quotations = await quotation_model_1.default.find({ rfqId })
        .populate('vendorId', 'companyName email rating contactPerson')
        .sort('grandTotal');
    return quotations.map((q) => ({
        _id: q._id,
        vendorId: q.vendorId,
        lineItems: q.lineItems,
        deliveryTimeline: q.deliveryTimeline,
        notes: q.notes,
        subtotal: q.subtotal,
        taxAmount: q.taxAmount,
        grandTotal: q.grandTotal,
        status: q.status,
        submittedAt: q.submittedAt,
    }));
};
exports.default = { submit, getByRFQ, getById, update, compareByRFQ };
//# sourceMappingURL=quotation.service.js.map