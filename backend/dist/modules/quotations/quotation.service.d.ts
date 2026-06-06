declare const _default: {
    submit: (data: any, userId: string) => Promise<import("mongoose").Document<unknown, {}, import("./quotation.model").IQuotation, {}, {}> & import("./quotation.model").IQuotation & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getByRFQ: (rfqId: string) => Promise<(import("mongoose").Document<unknown, {}, import("./quotation.model").IQuotation, {}, {}> & import("./quotation.model").IQuotation & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./quotation.model").IQuotation, {}, {}> & import("./quotation.model").IQuotation & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update: (id: string, data: any, userId: string) => Promise<import("mongoose").Document<unknown, {}, import("./quotation.model").IQuotation, {}, {}> & import("./quotation.model").IQuotation & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    compareByRFQ: (rfqId: string) => Promise<{
        _id: import("mongoose").Types.ObjectId;
        vendorId: import("mongoose").Types.ObjectId;
        lineItems: import("./quotation.model").IQuotationLineItem[];
        deliveryTimeline: number;
        notes: string | undefined;
        subtotal: number;
        taxAmount: number;
        grandTotal: number;
        status: "rejected" | "submitted" | "under_review" | "accepted";
        submittedAt: Date;
    }[]>;
};
export default _default;
//# sourceMappingURL=quotation.service.d.ts.map