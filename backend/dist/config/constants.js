"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION = exports.GST_RATE = exports.VENDOR_CATEGORY = exports.VENDOR_STATUS = exports.INVOICE_STATUS = exports.PO_STATUS = exports.APPROVAL_STATUS = exports.QUOTATION_STATUS = exports.RFQ_STATUS = exports.ROLES = void 0;
exports.ROLES = {
    ADMIN: 'Admin',
    PROCUREMENT_OFFICER: 'Procurement Officer',
    MANAGER: 'Manager',
    VENDOR: 'Vendor',
};
exports.RFQ_STATUS = {
    DRAFT: 'draft',
    OPEN: 'open',
    CLOSED: 'closed',
    AWARDED: 'awarded',
    CANCELLED: 'cancelled',
};
exports.QUOTATION_STATUS = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
};
exports.APPROVAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
exports.PO_STATUS = {
    GENERATED: 'generated',
    SENT: 'sent',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};
exports.INVOICE_STATUS = {
    GENERATED: 'generated',
    SENT: 'sent',
    PAID: 'paid',
    OVERDUE: 'overdue',
};
exports.VENDOR_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
};
exports.VENDOR_CATEGORY = {
    IT: 'IT',
    MANUFACTURING: 'Manufacturing',
    SERVICES: 'Services',
    LOGISTICS: 'Logistics',
    OTHER: 'Other',
};
exports.GST_RATE = 0.18;
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
};
//# sourceMappingURL=constants.js.map