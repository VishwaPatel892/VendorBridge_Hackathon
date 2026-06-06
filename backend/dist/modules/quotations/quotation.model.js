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
const quotationSchema = new mongoose_1.Schema({
    rfqId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    lineItems: [
        {
            rfqLineItemId: { type: String, required: true },
            unitPrice: { type: Number, required: true, min: 0 },
            totalPrice: { type: Number, required: true, min: 0 },
        },
    ],
    deliveryTimeline: { type: Number, required: true },
    notes: String,
    attachments: [
        {
            filename: String,
            url: String,
        },
    ],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    status: {
        type: String,
        enum: ['submitted', 'under_review', 'accepted', 'rejected'],
        default: 'submitted',
    },
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });
quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Quotation', quotationSchema);
//# sourceMappingURL=quotation.model.js.map