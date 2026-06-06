"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const approval_model_1 = __importDefault(require("./approval.model"));
const quotation_model_1 = __importDefault(require("../quotations/quotation.model"));
const rfq_model_1 = __importDefault(require("../rfq/rfq.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
const errorHandler_1 = require("../../middleware/errorHandler");
const constants_1 = require("../../config/constants");
const notification_service_1 = __importDefault(require("../notifications/notification.service"));
const initiate = async (data, userId) => {
    const quotation = await quotation_model_1.default.findById(data.quotationId).populate('vendorId');
    if (!quotation)
        throw new errorHandler_1.NotFoundError('Quotation');
    const rfq = await rfq_model_1.default.findById(data.rfqId);
    if (!rfq)
        throw new errorHandler_1.NotFoundError('RFQ');
    const manager = await user_model_1.default.findOne({ role: constants_1.ROLES.MANAGER, isActive: true });
    if (!manager)
        throw new errorHandler_1.AppError('No manager available for approval', 500);
    const approval = await approval_model_1.default.create({
        rfqId: data.rfqId,
        quotationId: data.quotationId,
        vendorId: quotation.vendorId,
        requestedBy: userId,
        assignedTo: manager._id,
        status: 'pending',
        timeline: [
            {
                step: 'initiated',
                status: 'pending',
                timestamp: new Date(),
                performedBy: userId,
            },
        ],
    });
    await (0, notification_service_1.default)({
        userId: manager._id.toString(),
        type: 'approval_pending',
        title: 'Approval Request Pending',
        message: `Approval needed for quotation on RFQ: ${rfq.title}`,
        entityId: approval._id.toString(),
        entityType: 'Approval',
    });
    return approval.populate(['rfqId', 'quotationId', 'vendorId', 'requestedBy', 'assignedTo']);
};
const getAll = async (query, userId, role) => {
    const filter = {};
    if (role === constants_1.ROLES.MANAGER) {
        filter.assignedTo = userId;
    }
    if (query.status)
        filter.status = query.status;
    return approval_model_1.default.find(filter)
        .populate('rfqId', 'title rfqNumber')
        .populate('quotationId', 'grandTotal')
        .populate('vendorId', 'companyName email')
        .populate('requestedBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort('-createdAt');
};
const getById = async (id) => {
    const approval = await approval_model_1.default.findById(id)
        .populate('rfqId', 'title rfqNumber category')
        .populate('quotationId')
        .populate('vendorId', 'companyName email contactPerson')
        .populate('requestedBy', 'name email')
        .populate('assignedTo', 'name email')
        .populate('timeline.performedBy', 'name email');
    if (!approval)
        throw new errorHandler_1.NotFoundError('Approval');
    return approval;
};
const approve = async (id, userId, remarks) => {
    const approval = await approval_model_1.default.findById(id);
    if (!approval)
        throw new errorHandler_1.NotFoundError('Approval');
    if (approval.status !== 'pending')
        throw new errorHandler_1.AppError('Approval already processed', 400);
    approval.status = 'approved';
    approval.remarks = remarks;
    approval.timeline.push({
        step: 'approved',
        status: 'approved',
        timestamp: new Date(),
        performedBy: userId,
    });
    await approval.save();
    await quotation_model_1.default.findByIdAndUpdate(approval.quotationId, { status: 'accepted' });
    await rfq_model_1.default.findByIdAndUpdate(approval.rfqId, { status: 'awarded' });
    await (0, notification_service_1.default)({
        userId: approval.requestedBy.toString(),
        type: 'approved',
        title: 'Approval Approved',
        message: 'Your approval request has been approved.',
        entityId: approval._id.toString(),
        entityType: 'Approval',
    });
    return approval;
};
const reject = async (id, userId, remarks) => {
    const approval = await approval_model_1.default.findById(id);
    if (!approval)
        throw new errorHandler_1.NotFoundError('Approval');
    if (approval.status !== 'pending')
        throw new errorHandler_1.AppError('Approval already processed', 400);
    approval.status = 'rejected';
    approval.remarks = remarks;
    approval.timeline.push({
        step: 'rejected',
        status: 'rejected',
        timestamp: new Date(),
        performedBy: userId,
    });
    await approval.save();
    await quotation_model_1.default.findByIdAndUpdate(approval.quotationId, { status: 'rejected' });
    await (0, notification_service_1.default)({
        userId: approval.requestedBy.toString(),
        type: 'rejected',
        title: 'Approval Rejected',
        message: `Your approval request has been rejected.${remarks ? ` Reason: ${remarks}` : ''}`,
        entityId: approval._id.toString(),
        entityType: 'Approval',
    });
    return approval;
};
exports.default = { initiate, getAll, getById, approve, reject };
//# sourceMappingURL=approval.service.js.map