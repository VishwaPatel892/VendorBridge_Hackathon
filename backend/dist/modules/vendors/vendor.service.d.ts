declare const _default: {
    getAll: (query: any) => Promise<(import("mongoose").Document<unknown, {}, import("./vendor.model").IVendor, {}, {}> & import("./vendor.model").IVendor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getById: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./vendor.model").IVendor, {}, {}> & import("./vendor.model").IVendor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create: (data: any, userId: string) => Promise<import("mongoose").Document<unknown, {}, import("./vendor.model").IVendor, {}, {}> & import("./vendor.model").IVendor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update: (id: string, data: any) => Promise<import("mongoose").Document<unknown, {}, import("./vendor.model").IVendor, {}, {}> & import("./vendor.model").IVendor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove: (id: string) => Promise<import("mongoose").Document<unknown, {}, import("./vendor.model").IVendor, {}, {}> & import("./vendor.model").IVendor & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getPerformance: (id: string) => Promise<{
        vendorId: string;
        companyName: string;
        rating: number;
        totalPOs: any;
        completedPOs: any;
        onTimeDeliveryRate: number;
        status: "pending" | "active" | "inactive";
    }>;
};
export default _default;
//# sourceMappingURL=vendor.service.d.ts.map