"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const po_model_1 = __importDefault(require("./po.model"));
const quotation_model_1 = __importDefault(require("../quotations/quotation.model"));
const approval_model_1 = __importDefault(require("../approvals/approval.model"));
const rfq_model_1 = __importDefault(require("../rfq/rfq.model"));
const vendor_model_1 = __importDefault(require("../vendors/vendor.model"));
const generatePONumber_1 = __importDefault(require("../../utils/generatePONumber"));
const errorHandler_1 = require("../../middleware/errorHandler");
const notification_service_1 = __importDefault(require("../notifications/notification.service"));
const generate = async (approvalOrQuotationId, userId, isQuotationId) => {
    let approval;
    if (isQuotationId) {
        approval = await approval_model_1.default.findOne({ quotationId: approvalOrQuotationId, status: 'approved' })
            .populate('quotationId')
            .populate('rfqId');
        if (!approval)
            throw new errorHandler_1.AppError('No approved approval found for this quotation', 400);
    }
    else {
        approval = await approval_model_1.default.findById(approvalOrQuotationId)
            .populate('quotationId')
            .populate('rfqId');
        if (!approval)
            throw new errorHandler_1.NotFoundError('Approval');
        if (approval.status !== 'approved')
            throw new errorHandler_1.AppError('Approval must be approved first', 400);
    }
    const quotation = await quotation_model_1.default.findById(approval.quotationId);
    if (!quotation)
        throw new errorHandler_1.NotFoundError('Quotation');
    const rfq = await rfq_model_1.default.findById(approval.rfqId);
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    const poNumber = await (0, generatePONumber_1.default)();
    const lineItems = rfq.lineItems.map((item) => {
        const quotedItem = quotation.lineItems.find((qi) => qi.rfqLineItemId === item._id?.toString());
        return {
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: quotedItem?.unitPrice || item.estimatedUnitPrice,
            totalPrice: quotedItem?.totalPrice || item.estimatedUnitPrice * item.quantity,
        };
    });
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.18;
    const grandTotal = subtotal + taxAmount;
    const po = await po_model_1.default.create({
        poNumber,
        rfqId: approval.rfqId,
        quotationId: approval.quotationId,
        vendorId: approval.vendorId,
        approvalId: approval._id,
        lineItems,
        subtotal,
        taxAmount,
        grandTotal,
        status: 'generated',
        createdBy: userId,
    });
    await rfq_model_1.default.findByIdAndUpdate(approval.rfqId, { status: 'awarded' });
    const vendor = await vendor_model_1.default.findById(approval.vendorId).populate('userId');
    if (vendor && vendor.userId) {
        await (0, notification_service_1.default)({
            userId: vendor.userId.toString(),
            type: 'po_generated',
            title: 'Purchase Order Generated',
            message: `PO ${poNumber} has been generated for ${rfq.title}`,
            entityId: po._id.toString(),
            entityType: 'PurchaseOrder',
        });
    }
    return po.populate(['rfqId', 'vendorId', 'quotationId', 'approvalId', 'createdBy']);
};
const getAll = async (query, userId, role) => {
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (role === 'Vendor') {
        const vendor = await vendor_model_1.default.findOne({ userId });
        if (vendor)
            filter.vendorId = vendor._id;
    }
    return po_model_1.default.find(filter)
        .populate('vendorId', 'companyName email')
        .populate('rfqId', 'title rfqNumber')
        .sort('-createdAt');
};
const getById = async (id) => {
    const po = await po_model_1.default.findById(id)
        .populate('vendorId', 'companyName email contactPerson phone')
        .populate('rfqId', 'title rfqNumber description category deadline')
        .populate('quotationId', 'deliveryTimeline notes')
        .populate('approvalId', 'status remarks')
        .populate('createdBy', 'name email');
    if (!po)
        throw new errorHandler_1.NotFoundError('Purchase Order');
    return po;
};
const updateStatus = async (id, status) => {
    const validTransitions = {
        generated: ['sent', 'cancelled'],
        sent: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: [],
    };
    const po = await po_model_1.default.findById(id);
    if (!po)
        throw new errorHandler_1.NotFoundError('Purchase Order');
    if (!validTransitions[po.status]?.includes(status)) {
        throw new errorHandler_1.AppError(`Cannot transition from ${po.status} to ${status}`, 400);
    }
    po.status = status;
    return po.save();
};
exports.default = { generate, getAll, getById, updateStatus };
//# sourceMappingURL=po.service.js.map