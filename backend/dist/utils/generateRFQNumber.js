"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rfq_model_1 = __importDefault(require("../modules/rfq/rfq.model"));
const generateRFQNumber = async () => {
    const count = await rfq_model_1.default.countDocuments();
    const year = new Date().getFullYear();
    return `RFQ-${year}-${String(count + 1).padStart(4, '0')}`;
};
exports.default = generateRFQNumber;
//# sourceMappingURL=generateRFQNumber.js.map