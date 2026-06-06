"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_model_1 = __importDefault(require("../vendors/vendor.model"));
const rfq_model_1 = __importDefault(require("../rfq/rfq.model"));
const approval_model_1 = __importDefault(require("../approvals/approval.model"));
const po_model_1 = __importDefault(require("../purchase-orders/po.model"));
const getDashboard = async () => {
    const [totalVendors, activeVendors, activeRFQs, pendingApprovals, recentRFQs, recentPOs, totalSpendResult,] = await Promise.all([
        vendor_model_1.default.countDocuments(),
        vendor_model_1.default.countDocuments({ status: 'active' }),
        rfq_model_1.default.countDocuments({ status: 'open' }),
        approval_model_1.default.countDocuments({ status: 'pending' }),
        rfq_model_1.default.find().sort('-createdAt').limit(5).select('rfqNumber title status createdAt'),
        po_model_1.default.find().sort('-createdAt').limit(5).populate('vendorId', 'companyName').select('poNumber grandTotal status createdAt'),
        po_model_1.default.aggregate([
            { $group: { _id: null, total: { $sum: '$grandTotal' } } },
        ]),
    ]);
    const totalSpend = totalSpendResult[0]?.total || 0;
    return {
        totalVendors,
        activeVendors,
        activeRFQs,
        pendingApprovals,
        totalSpend,
        recentRFQs,
        recentPOs,
    };
};
const getSpendAnalytics = async () => {
    const monthlySpend = await po_model_1.default.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                total: { $sum: '$grandTotal' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
    ]);
    const categorySpend = await po_model_1.default.aggregate([
        {
            $lookup: {
                from: 'rfqs',
                localField: 'rfqId',
                foreignField: '_id',
                as: 'rfq',
            },
        },
        { $unwind: '$rfq' },
        {
            $group: {
                _id: '$rfq.category',
                total: { $sum: '$grandTotal' },
                count: { $sum: 1 },
            },
        },
        { $sort: { total: -1 } },
    ]);
    return { monthlySpend, categorySpend };
};
const getVendorPerformance = async () => {
    return vendor_model_1.default.aggregate([
        {
            $lookup: {
                from: 'purchaseorders',
                localField: '_id',
                foreignField: 'vendorId',
                as: 'pos',
            },
        },
        {
            $project: {
                companyName: 1,
                email: 1,
                category: 1,
                status: 1,
                rating: 1,
                totalPOs: { $size: '$pos' },
                totalSpend: { $sum: '$pos.grandTotal' },
                completedPOs: {
                    $size: {
                        $filter: {
                            input: '$pos',
                            as: 'po',
                            cond: { $eq: ['$$po.status', 'delivered'] },
                        },
                    },
                },
            },
        },
        { $sort: { totalSpend: -1 } },
    ]);
};
const getRFQConversion = async () => {
    const totalRFQs = await rfq_model_1.default.countDocuments();
    const awardedRFQs = await rfq_model_1.default.countDocuments({ status: 'awarded' });
    const conversionRate = totalRFQs > 0 ? (awardedRFQs / totalRFQs) * 100 : 0;
    const monthly = await rfq_model_1.default.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                total: { $sum: 1 },
                awarded: {
                    $sum: { $cond: [{ $eq: ['$status', 'awarded'] }, 1, 0] },
                },
            },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
    ]);
    return { totalRFQs, awardedRFQs, conversionRate, monthly };
};
exports.default = { getDashboard, getSpendAnalytics, getVendorPerformance, getRFQConversion };
//# sourceMappingURL=analytics.service.js.map