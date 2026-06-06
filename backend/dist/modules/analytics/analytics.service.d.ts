declare const _default: {
    getDashboard: () => Promise<{
        totalVendors: number;
        activeVendors: number;
        activeRFQs: number;
        pendingApprovals: number;
        totalSpend: any;
        recentRFQs: (import("mongoose").Document<unknown, {}, import("../rfq/rfq.model").IRFQ, {}, {}> & import("../rfq/rfq.model").IRFQ & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        recentPOs: (import("mongoose").Document<unknown, {}, import("../purchase-orders/po.model").IPO, {}, {}> & import("../purchase-orders/po.model").IPO & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getSpendAnalytics: () => Promise<{
        monthlySpend: any[];
        categorySpend: any[];
    }>;
    getVendorPerformance: () => Promise<any[]>;
    getRFQConversion: () => Promise<{
        totalRFQs: number;
        awardedRFQs: number;
        conversionRate: number;
        monthly: any[];
    }>;
};
export default _default;
//# sourceMappingURL=analytics.service.d.ts.map