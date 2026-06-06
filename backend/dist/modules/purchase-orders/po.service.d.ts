declare const _default: {
    generate: (approvalOrQuotationId: string, userId: string, isQuotationId?: boolean) => Promise<Omit<import("mongoose").Document<unknown, {}, import("./po.model").IPO, {}, {}> & import("./po.model").IPO & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getAll: (query: any, userId: string, role: string) => Promise<(import("mongoose").Document<unknown, {}, import("./po.model").IPO, {}, {}> & import("./po.model").IPO & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./po.model").IPO, {}, {}> & import("./po.model").IPO & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus: (id: string, status: string) => Promise<import("mongoose").Document<unknown, {}, import("./po.model").IPO, {}, {}> & import("./po.model").IPO & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
};
export default _default;
//# sourceMappingURL=po.service.d.ts.map