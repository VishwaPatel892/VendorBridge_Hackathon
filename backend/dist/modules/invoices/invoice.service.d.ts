declare const _default: {
    generate: (poId: string, userId: string) => Promise<Omit<import("mongoose").Document<unknown, {}, import("./invoice.model").IInvoice, {}, {}> & import("./invoice.model").IInvoice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getAll: (query: any, userId: string, role: string) => Promise<(import("mongoose").Document<unknown, {}, import("./invoice.model").IInvoice, {}, {}> & import("./invoice.model").IInvoice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./invoice.model").IInvoice, {}, {}> & import("./invoice.model").IInvoice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getPDF: (id: string) => Promise<Buffer>;
    sendEmail: (id: string, emailData: any) => Promise<import("mongoose").Document<unknown, {}, import("./invoice.model").IInvoice, {}, {}> & import("./invoice.model").IInvoice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus: (id: string, status: string) => Promise<import("mongoose").Document<unknown, {}, import("./invoice.model").IInvoice, {}, {}> & import("./invoice.model").IInvoice & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
};
export default _default;
//# sourceMappingURL=invoice.service.d.ts.map