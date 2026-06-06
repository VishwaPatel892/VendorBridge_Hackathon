"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRFQConversion = exports.getVendorPerformance = exports.getSpend = exports.getDashboard = void 0;
const analytics_service_1 = __importDefault(require("./analytics.service"));
const getDashboard = async (_req, res, next) => {
    try {
        const data = await analytics_service_1.default.getDashboard();
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
const getSpend = async (_req, res, next) => {
    try {
        const data = await analytics_service_1.default.getSpendAnalytics();
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getSpend = getSpend;
const getVendorPerformance = async (_req, res, next) => {
    try {
        const data = await analytics_service_1.default.getVendorPerformance();
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorPerformance = getVendorPerformance;
const getRFQConversion = async (_req, res, next) => {
    try {
        const data = await analytics_service_1.default.getRFQConversion();
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getRFQConversion = getRFQConversion;
//# sourceMappingURL=analytics.controller.js.map