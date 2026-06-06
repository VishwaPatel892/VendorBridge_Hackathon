"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vendor_model_1 = __importDefault(require("./vendor.model"));
const errorHandler_1 = require("../../middleware/errorHandler");
const getAll = async (query) => {
    const filter = {};
    if (query.category)
        filter.category = query.category;
    if (query.status)
        filter.status = query.status;
    if (query.search) {
        filter.$or = [
            { companyName: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
            { contactPerson: { $regex: query.search, $options: 'i' } },
        ];
    }
    return vendor_model_1.default.find(filter).populate('createdBy', 'name email').sort('-createdAt');
};
const getById = async (id) => {
    const vendor = await vendor_model_1.default.findById(id).populate('createdBy', 'name email');
    if (!vendor)
        throw new errorHandler_1.NotFoundError('Vendor');
    return vendor;
};
const create = async (data, userId) => {
    const existing = await vendor_model_1.default.findOne({ email: data.email });
    if (existing)
        throw new errorHandler_1.AppError('Vendor with this email already exists', 409);
    return vendor_model_1.default.create({ ...data, createdBy: userId });
};
const update = async (id, data) => {
    const vendor = await vendor_model_1.default.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!vendor)
        throw new errorHandler_1.NotFoundError('Vendor');
    return vendor;
};
const remove = async (id) => {
    const vendor = await vendor_model_1.default.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!vendor)
        throw new errorHandler_1.NotFoundError('Vendor');
    return vendor;
};
const getPerformance = async (id) => {
    const vendor = await vendor_model_1.default.findById(id);
    if (!vendor)
        throw new errorHandler_1.NotFoundError('Vendor');
    const PurchaseOrder = require('../purchase-orders/po.model').default;
    const poCount = await PurchaseOrder.countDocuments({ vendorId: id });
    const completedPOs = await PurchaseOrder.countDocuments({ vendorId: id, status: 'delivered' });
    const onTimeDeliveryRate = poCount > 0 ? Math.round((completedPOs / poCount) * 100) : 0;
    return {
        vendorId: id,
        companyName: vendor.companyName,
        rating: vendor.rating,
        totalPOs: poCount,
        completedPOs,
        onTimeDeliveryRate,
        status: vendor.status,
    };
};
exports.default = { getAll, getById, create, update, remove, getPerformance };
//# sourceMappingURL=vendor.service.js.map