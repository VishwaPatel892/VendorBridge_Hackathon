declare const _default: {
    getAll: (query: any, userId: string, role: string) => Promise<(import("mongoose").Document<unknown, {}, import("./rfq.model").IRFQ, {}, {}> & import("./rfq.model").IRFQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./rfq.model").IRFQ, {}, {}> & import("./rfq.model").IRFQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create: (data: any, userId: string) => Promise<import("mongoose").Document<unknown, {}, import("./rfq.model").IRFQ, {}, {}> & import("./rfq.model").IRFQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update: (id: string, data: any, userId: string) => Promise<import("mongoose").Document<unknown, {}, import("./rfq.model").IRFQ, {}, {}> & import("./rfq.model").IRFQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    publish: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./rfq.model").IRFQ, {}, {}> & import("./rfq.model").IRFQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    close: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./rfq.model").IRFQ, {}, {}> & import("./rfq.model").IRFQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    assignVendors: (id: string, vendorIds: string[]) => Promise<import("mongoose").Document<unknown, {}, import("./rfq.model").IRFQ, {}, {}> & import("./rfq.model").IRFQ & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
};
export default _default;
//# sourceMappingURL=rfq.service.d.ts.map