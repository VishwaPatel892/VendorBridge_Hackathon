export declare const ROLES: {
    readonly ADMIN: "Admin";
    readonly PROCUREMENT_OFFICER: "Procurement Officer";
    readonly MANAGER: "Manager";
    readonly VENDOR: "Vendor";
};
export type UserRole = (typeof ROLES)[keyof typeof ROLES];
export declare const RFQ_STATUS: {
    readonly DRAFT: "draft";
    readonly OPEN: "open";
    readonly CLOSED: "closed";
    readonly AWARDED: "awarded";
    readonly CANCELLED: "cancelled";
};
export declare const QUOTATION_STATUS: {
    readonly SUBMITTED: "submitted";
    readonly UNDER_REVIEW: "under_review";
    readonly ACCEPTED: "accepted";
    readonly REJECTED: "rejected";
};
export declare const APPROVAL_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
};
export declare const PO_STATUS: {
    readonly GENERATED: "generated";
    readonly SENT: "sent";
    readonly DELIVERED: "delivered";
    readonly CANCELLED: "cancelled";
};
export declare const INVOICE_STATUS: {
    readonly GENERATED: "generated";
    readonly SENT: "sent";
    readonly PAID: "paid";
    readonly OVERDUE: "overdue";
};
export declare const VENDOR_STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
    readonly PENDING: "pending";
};
export declare const VENDOR_CATEGORY: {
    readonly IT: "IT";
    readonly MANUFACTURING: "Manufacturing";
    readonly SERVICES: "Services";
    readonly LOGISTICS: "Logistics";
    readonly OTHER: "Other";
};
export declare const GST_RATE = 0.18;
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
};
//# sourceMappingURL=constants.d.ts.map