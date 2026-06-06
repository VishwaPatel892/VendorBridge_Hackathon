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
const rfqSchema = new mongoose_1.Schema({
    rfqNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    lineItems: [
        {
            productName: { type: String, required: true },
            description: String,
            quantity: { type: Number, required: true, min: 1 },
            unit: { type: String, required: true },
            estimatedUnitPrice: { type: Number, required: true, min: 0 },
        },
    ],
    attachments: [
        {
            filename: String,
            url: String,
            cloudinaryId: String,
        },
    ],
    deadline: { type: Date, required: true },
    status: {
        type: String,
        enum: ['draft', 'open', 'closed', 'awarded', 'cancelled'],
        default: 'draft',
    },
    assignedVendors: [
        {
            vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true },
            invitedAt: { type: Date, default: Date.now },
            status: {
                type: String,
                enum: ['invited', 'responded', 'declined'],
                default: 'invited',
            },
        },
    ],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
exports.default = mongoose_1.default.model('RFQ', rfqSchema);
//# sourceMappingURL=rfq.model.js.map