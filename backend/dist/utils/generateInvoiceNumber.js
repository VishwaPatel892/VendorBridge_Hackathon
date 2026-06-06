"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const invoice_model_1 = __importDefault(require("../modules/invoices/invoice.model"));
const generateInvoiceNumber = async () => {
    const count = await invoice_model_1.default.countDocuments();
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};
exports.default = generateInvoiceNumber;
//# sourceMappingURL=generateInvoiceNumber.js.map