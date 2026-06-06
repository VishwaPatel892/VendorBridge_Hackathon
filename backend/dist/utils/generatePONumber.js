"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const po_model_1 = __importDefault(require("../modules/purchase-orders/po.model"));
const generatePONumber = async () => {
    const count = await po_model_1.default.countDocuments();
    const year = new Date().getFullYear();
    return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
};
exports.default = generatePONumber;
//# sourceMappingURL=generatePONumber.js.map