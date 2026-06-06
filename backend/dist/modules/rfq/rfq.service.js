"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rfq_model_1 = __importDefault(require("./rfq.model"));
const vendor_model_1 = __importDefault(require("../vendors/vendor.model"));
const generateRFQNumber_1 = __importDefault(require("../../utils/generateRFQNumber"));
const errorHandler_1 = require("../../middleware/errorHandler");
const notification_service_1 = __importDefault(require("../notifications/notification.service"));
const VALID_TRANSITIONS = {
    draft: ['open', 'cancelled'],
    open: ['closed', 'cancelled'],
    closed: ['awarded', 'cancelled'],
    awarded: [],
    cancelled: [],
};
const getAll = async (query, userId, role) => {
    const filter = {};
    if (query.category)
        filter.category = query.category;
    if (query.status)
        filter.status = query.status;
    if (role === 'Vendor') {
        const vendor = await vendor_model_1.default.findOne({ userId });
        if (vendor) {
            filter['assignedVendors.vendorId'] = vendor._id;
        }
    }
    if (query.search) {
        filter.$or = [
            { title: { $regex: query.search, $options: 'i' } },
            { rfqNumber: { $regex: query.search, $options: 'i' } },
        ];
    }
    return rfq_model_1.default.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedVendors.vendorId', 'companyName email')
        .sort('-createdAt');
};
const getById = async (id) => {
    const rfq = await rfq_model_1.default.findById(id)
        .populate('createdBy', 'name email')
        .populate('assignedVendors.vendorId', 'companyName email contactPerson');
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    return rfq;
};
const create = async (data, userId) => {
    const rfqNumber = await (0, generateRFQNumber_1.default)();
    return rfq_model_1.default.create({
        ...data,
        rfqNumber,
        status: 'draft',
        createdBy: userId,
    });
};
const update = async (id, data, userId) => {
    const rfq = await rfq_model_1.default.findById(id);
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    if (rfq.status !== 'draft')
        throw new errorHandler_1.AppError('Can only edit RFQ in draft status', 400);
    Object.assign(rfq, data);
    return rfq.save();
};
const publish = async (id) => {
    const rfq = await rfq_model_1.default.findById(id);
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    if (!VALID_TRANSITIONS[rfq.status]?.includes('open')) {
        throw new errorHandler_1.AppError(`Cannot publish RFQ from status ${rfq.status}`, 400);
    }
    rfq.status = 'open';
    await rfq.save();
    for (const av of rfq.assignedVendors) {
        const vendor = await vendor_model_1.default.findById(av.vendorId).populate('userId');
        if (vendor && vendor.userId) {
            await (0, notification_service_1.default)({
                userId: vendor.userId.toString(),
                type: 'rfq_invite',
                title: 'New RFQ Invitation',
                message: `You have been invited to quote on: ${rfq.title}`,
                entityId: rfq._id.toString(),
                entityType: 'RFQ',
            });
        }
    }
    return rfq;
};
const close = async (id) => {
    const rfq = await rfq_model_1.default.findById(id);
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    if (!VALID_TRANSITIONS[rfq.status]?.includes('closed')) {
        throw new errorHandler_1.AppError(`Cannot close RFQ from status ${rfq.status}`, 400);
    }
    rfq.status = 'closed';
    return rfq.save();
};
const assignVendors = async (id, vendorIds) => {
    const rfq = await rfq_model_1.default.findById(id);
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    const existingIds = rfq.assignedVendors.map((v) => v.vendorId.toString());
    const toAdd = vendorIds.filter((vId) => !existingIds.includes(vId));
    const toRemove = existingIds.filter((vId) => !vendorIds.includes(vId));
    rfq.assignedVendors = rfq.assignedVendors.filter((v) => !toRemove.includes(v.vendorId.toString()));
    for (const vId of toAdd) {
        rfq.assignedVendors.push({
            vendorId: vId,
            invitedAt: new Date(),
            status: 'invited',
        });
    }
    return rfq.save();
};
exports.default = { getAll, getById, create, update, publish, close, assignVendors };
//# sourceMappingURL=rfq.service.js.map