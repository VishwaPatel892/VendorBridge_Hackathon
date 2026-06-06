"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const poSchema = new mongoose_1.Schema({
    poNumber: { type: String, required: true, unique: true },
    rfqId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    quotationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Quotation',
        required: true,
    },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    approvalId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Approval',
        required: true,
    },
    lineItems: [
        {
            productName: { type: String, required: true },
            quantity: { type: Number, required: true },
            unit: { type: String, required: true },
            unitPrice: { type: Number, required: true },
            totalPrice: { type: Number, required: true },
        },
    ],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    terms: String,
    deliveryDate: Date,
    status: {
        type: String,
        enum: ['generated', 'sent', 'delivered', 'cancelled'],
        default: 'generated',
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('PurchaseOrder', poSchema);
//# sourceMappingURL=po.model.js.map