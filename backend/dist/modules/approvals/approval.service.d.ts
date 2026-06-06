declare const _default: {
    initiate: (data: any, userId: string) => Promise<Omit<import("mongoose").Document<unknown, {}, import("./approval.model").IApproval, {}, {}> & import("./approval.model").IApproval & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    getAll: (query: any, userId: string, role: string) => Promise<(import("mongoose").Document<unknown, {}, import("./approval.model").IApproval, {}, {}> & import("./approval.model").IApproval & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./approval.model").IApproval, {}, {}> & import("./approval.model").IApproval & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    approve: (id: string, userId: string, remarks?: string) => Promise<import("mongoose").Document<unknown, {}, import("./approval.model").IApproval, {}, {}> & import("./approval.model").IApproval & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    reject: (id: string, userId: string, remarks?: string) => Promise<import("mongoose").Document<unknown, {}, import("./approval.model").IApproval, {}, {}> & import("./approval.model").IApproval & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
};
export default _default;
//# sourceMappingURL=approval.service.d.ts.map